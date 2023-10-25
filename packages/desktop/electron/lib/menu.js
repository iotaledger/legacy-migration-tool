import { app, ipcMain, Menu, shell } from 'electron'
import { AccountRoute, ExternalRoute } from 'shared/lib/core/router/enums'
import { closeAboutWindow, getOrInitWindow, openAboutWindow } from '../main'
import { menuState } from './menuState'

let state = menuState

/**
 * Creates a native menu tree and applies it to the application window
 */
export const initMenu = () => {
    let mainMenu = null

    const createMenu = () => {
        const template = buildTemplate()
        const applicationMenu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(applicationMenu)

        // setApplicationMenu sets the menu for all top level windows
        // which breaks the about window, if we try and set the about
        // window menu to null it resizes. We would also need to re-apply
        // the localisation, so just close it
        closeAboutWindow()

        return applicationMenu
    }

    app.once('ready', () => {
        ipcMain.handle('menu-update', (e, args) => {
            /* eslint-disable no-import-assign */
            state = Object.assign({}, state, args)
            mainMenu = createMenu()
        })

        ipcMain.handle('menu-popup', () => {
            mainMenu.popup(getOrInitWindow('main'))
        })

        ipcMain.handle('menu-data', () => state)

        ipcMain.handle('maximize', () => {
            const isMaximized = getOrInitWindow('main').isMaximized()
            if (isMaximized) {
                getOrInitWindow('main').restore()
            } else {
                getOrInitWindow('main').maximize()
            }
            return !isMaximized
        })

        ipcMain.handle('isMaximized', () => getOrInitWindow('main').isMaximized())

        ipcMain.handle('minimize', () => {
            getOrInitWindow('main').minimize()
        })

        ipcMain.handle('close', () => {
            getOrInitWindow('main').close()
        })

        mainMenu = createMenu()
    })
}

/**
 * Builds menu template
 * @returns {Array} Menu template
 */
const buildTemplate = () => {
    const template = [
        {
            label: app.name,
            submenu: [
                {
                    label: `${state.strings.about} ${app.name}`,
                    click: () => openAboutWindow(),
                    enabled: state.enabled,
                },
                {
                    type: 'separator',
                },
                {
                    label: state.strings.diagnostics,
                    click: () => getOrInitWindow('main').webContents.send('menu-diagnostics'),
                },
            ],
        },
    ]

    if (!app.isPackaged) {
        template[0].submenu.push({
            label: 'Developer Tools',
            role: 'toggleDevTools',
        })
    }

    template[0].submenu = template[0].submenu.concat([
        {
            label: state.strings.errorLog,
            click: () => getOrInitWindow('main').webContents.send('menu-error-log'),
        },
    ])

    if (process.platform === 'darwin') {
        template[0].submenu = template[0].submenu.concat([
            {
                label: `${state.strings.hide} ${app.name}`,
                role: 'hide',
            },
            {
                label: state.strings.hideOthers,
                role: 'hideothers',
            },
            {
                label: state.strings.showAll,
                role: 'unhide',
            },
            {
                type: 'separator',
            },
        ])
    }

    template[0].submenu = template[0].submenu.concat([
        {
            label: state.strings.quit,
            accelerator: process.platform === 'win32' ? 'Alt+F4' : 'CmdOrCtrl+Q',
            click: function () {
                app.quit()
            },
        },
    ])

    template.push({
        label: state.strings.help,
        submenu: [
            {
                label: state.strings.discord,
                click: function () {
                    shell.openExternal(ExternalRoute.Discord)
                },
            },
            {
                label: state.strings.reportAnIssue,
                click: function () {
                    shell.openExternal(ExternalRoute.IssueReport)
                },
            },
        ],
    })
    return template
}
