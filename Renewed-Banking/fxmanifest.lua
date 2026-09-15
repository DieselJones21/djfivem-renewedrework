fx_version 'cerulean'
game 'gta5'
version '2.5.0'

description 'Renewed Banking — The 305 UI rework'
author 'uShifty (original) / The 305 rework'

lua54 'yes'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
}

client_scripts {
    'client/framework.lua',
    'client/main.lua',
    'client/menus.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/framework.lua',
    'server/main.lua',
    'server/loans.lua'
}

ui_page 'web/public/index.html'

files {
  'web/public/index.html',
  'web/public/**/*',
  'locales/*.json'
}

provide 'qb-management'
provide 'esx_society'
