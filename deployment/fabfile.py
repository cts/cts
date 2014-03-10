from fabric.api import run, sudo, cd, env, local

env.roledefs = {
  'prod': ['eob@treesheets.csail.mit.edu'],
}

def restart_nginx():
  """Restarts nginx."""
  sudo('/etc/init.d/nginx restart')

def restart_treesheets():
  """Restarts the NodeJS process."""
  # The restart command in my init.d script fails for some reason.
  # But stop and start works.
  # TODO(eob): Fix the restart init.d script.
  sudo('/etc/init.d/treesheets stop')
  sudo('/etc/init.d/treesheets start')

def update_treesheets():
  """Updates git."""
  with cd('/sites/treesheets.org/code'):
    run('git pull origin master')
    run('git submodule update')
    run('git submodule -q foreach git pull -q origin master')

def refresh_cts():
  """Refreshes the local CTS and CTSUI files."""
  local('cd ../../cts-js && grunt')
  local('cp ../../cts-js/release/cts.js ../static/hotlink/cts.js')
  local('cd ../../cts-ui && grunt')
  local('cp ../../cts-ui/release/cts-ui.js ../static/hotlink/cts-ui.js')
  local('git add ../static/hotlink/cts.js')
  local('git add ../static/hotlink/cts-ui.js')
  local('git commit -m "refreshing CTS JS and UI [fabfile]"')
  local('git push origin master')

def deploy():
  """Updates git and restarts."""
  update_treesheets()
  restart_treesheets()

def push_mockups():
  """Copies mockups from cts-ui to mockups package, commits, and pushes"""
  local('cd ../../cts-ui && grunt')
  local('cp ../../cts-ui/mockups/css/*.css ../../mockups/cts-ui/css/.')
  local('cp -R ../../cts-ui/mockups/css/bootstrap ../../mockups/cts-ui/css/bootstrap')
  local('cp -R ../../cts-ui/mockups/img ../../mockups/cts-ui/img')
  local('cp ../../cts-ui/mockups/*.html ../../mockups/cts-ui/.')
  local('cd ../../mockups/cts-ui && git add *.html')
  local('cd ../../mockups/cts-ui/css && git add *.css')
  local('cd ../../mockups/cts-ui/css && git add bootstrap/*')
  local('cd ../../mockups/cts-ui && git add img/*')
  local('cd ../../mockups && git commit -am "New cts-ui mockups [fabfile]"')
  local('cd ../../mockups && git push origin master')

def full_deploy():
  """Refresh, copy mockups, deploy"""
  refresh_cts()
  push_mockups()
  deploy()

def main():
  print """
  This file uses Fabric <http://fabfile.org> to run.

  Usage:
    fab -R prod <COMMAND>

  For fab list of commands:
    fab --list
"""

if __name__ == "__main__":
  main()
