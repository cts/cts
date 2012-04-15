# VENDORS
vendor 'jquery', 'vendors/jquery.js'
# vendor 'vendor_id_b', 'vendors/id_b.js'

# ROOT SRC FOLDER
src 'src'

# MODULES
module 'HCSS' # module folder name (inside src)
	vendors: ['jquery'] # (ordered vendor's array)
	bare: false # default = false (compile coffeescript with bare option)
	packaging: true # default = true
	expose: null # default = null (if informed, link all objects inside it)
	minify: false # default = false (minifies release file only)

# module 'another_module_folder'
# 	(...)

# BUILD ROUTINES
build "main"
	modules: ['HCSS']
	release: 'release/hcss.js'
	debug: 'release/hcss-debug.js'

# build 'another_build_routine'
# 	(...)
