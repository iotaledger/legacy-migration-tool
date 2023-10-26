<script lang="typescript">
    import { Locale, _, isLocaleLoaded, localeDirection, setupI18n } from '@core/i18n'
    import { AppRoute, initRouters } from '@core/router'
    import { Popup, Route, TitleBar, ToastContainer } from 'shared/components'
    import { loggedIn, stage } from 'shared/lib/app'
    import { appSettings, initAppSettings } from 'shared/lib/appSettings'
    import { Electron } from 'shared/lib/electron'
    import { addError } from 'shared/lib/errors'
    import { goto } from 'shared/lib/helpers'
    import { pollMarketData } from 'shared/lib/market'
    import { openPopup, popupState } from 'shared/lib/popup'
    import { cleanupEmptyProfiles, renameOldProfileFoldersToId } from 'shared/lib/profile'
    import { Stage } from 'shared/lib/typings/stage'
    import {
        Backup,
        Balance,
        Congratulations,
        CrashReporting,
        Import,
        Ledger,
        Legal,
        Migrate,
        Password,
        Protect,
        Secure,
        Setup,
        Splash,
        Welcome,
    } from 'shared/routes'
    import { onMount } from 'svelte'
    import { getLocalisedMenuItems } from './lib/helpers'

    stage.set(Stage[process.env.STAGE.toUpperCase()] ?? Stage.ALPHA)

    const handleCrashReporting = async (sendCrashReports: boolean): Promise<void> =>
        Electron.updateAppSettings({ sendCrashReports })

    $: void handleCrashReporting($appSettings.sendCrashReports)
    $: $appSettings.darkMode
        ? document.body.classList.add('scheme-dark')
        : document.body.classList.remove('scheme-dark')

    $: {
        isLocaleLoaded.subscribe((loaded) => {
            if (loaded) {
                Electron.updateMenu('strings', getLocalisedMenuItems($_ as Locale))
            }
        })
    }
    $: Electron.updateMenu('loggedIn', $loggedIn)

    $: if (document.dir !== $localeDirection) {
        document.dir = $localeDirection
    }

    let splash = true

    void setupI18n({ fallbackLocale: 'en', initialLocale: $appSettings.language })

    onMount(async () => {
        setTimeout(() => {
            splash = false
            initRouters()
        }, 3000)

        await renameOldProfileFoldersToId()

        initAppSettings.set($appSettings)

        await pollMarketData()

        // @ts-ignore: This value is replaced by Webpack DefinePlugin
        /* eslint-disable no-undef */
        Electron.onEvent('menu-error-log', () => {
            openPopup({ type: 'errorLog' })
        })
        Electron.onEvent('menu-diagnostics', () => {
            openPopup({ type: 'diagnostics' })
        })
        Electron.hookErrorLogger((err) => {
            addError(err)
        })

        await cleanupEmptyProfiles()
    })
</script>

<TitleBar>
    <!-- empty div to avoid auto-purge removing dark classes -->
    <div class="scheme-dark" />
    {#if !$isLocaleLoaded || splash}
        <Splash />
    {:else}
        {#if $popupState.active}
            <Popup
                type={$popupState.type}
                props={$popupState.props}
                hideClose={$popupState.hideClose}
                fullScreen={$popupState.fullScreen}
                transition={$popupState.transition}
                overflow={$popupState.overflow}
                locale={$_}
            />
        {/if}
        <Route route={AppRoute.Welcome}>
            <Welcome locale={$_} />
        </Route>
        <Route route={AppRoute.Legal}>
            <Legal locale={$_} />
        </Route>
        <Route route={AppRoute.CrashReporting}>
            <CrashReporting locale={$_} />
        </Route>
        <Route route={AppRoute.Setup}>
            <Setup locale={$_} />
        </Route>
        <Route route={AppRoute.LedgerSetup}>
            <Ledger locale={$_} />
        </Route>
        <!--  -->
        <Route route={AppRoute.Secure}>
            <Secure locale={$_} />
        </Route>
        <Route route={AppRoute.Password}>
            <Password locale={$_} />
        </Route>
        <Route route={AppRoute.Protect} transition={false}>
            <Protect locale={$_} />
        </Route>
        <Route route={AppRoute.Backup} transition={false}>
            <Backup locale={$_} />
        </Route>
        <Route route={AppRoute.Import} transition={false}>
            <Import locale={$_} />
        </Route>
        <Route route={AppRoute.Balance}>
            <Balance locale={$_} />
        </Route>
        <Route route={AppRoute.Migrate}>
            <Migrate locale={$_} {goto} />
        </Route>
        <Route route={AppRoute.Congratulations}>
            <Congratulations locale={$_} {goto} />
        </Route>

        <ToastContainer />
    {/if}
</TitleBar>

<style global type="text/scss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    @import '../shared/style/style.scss';
    html,
    body {
        @apply bg-white;
        @apply select-none;
        -webkit-user-drag: none;

        ::-webkit-scrollbar {
            @apply w-5;
            @apply h-5;
        }

        ::-webkit-scrollbar-track {
            @apply bg-transparent;
        }

        ::-webkit-scrollbar-corner {
            @apply bg-transparent;
        }

        ::-webkit-scrollbar-thumb {
            @apply bg-gray-300;
            @apply border-solid;
            @apply rounded-2xl;
            border-width: 7px;
            /* This needs to match the background it is displayed on
               and can be override in local components using the secondary
               and tertiary styles */
            @apply border-white;
        }

        .scroll-secondary {
            &::-webkit-scrollbar-thumb {
                @apply border-white;
            }
        }

        .scroll-tertiary {
            &::-webkit-scrollbar-thumb {
                @apply border-gray-50;
            }
        }

        .scroll-quaternary {
            &::-webkit-scrollbar-thumb {
                @apply border-gray-100;
            }
        }

        &.scheme-dark {
            @apply bg-gray-900;
            :global(::-webkit-scrollbar-thumb) {
                @apply bg-gray-700;
                @apply border-gray-900;
            }

            .scroll-secondary {
                &::-webkit-scrollbar-thumb {
                    @apply border-gray-800;
                }
            }

            .scroll-tertiary {
                &::-webkit-scrollbar-thumb {
                    @apply border-gray-900;
                }
            }

            .scroll-quaternary {
                &::-webkit-scrollbar-thumb {
                    @apply border-gray-900;
                }
            }
        }

        .multiwrap-line2 {
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            display: -webkit-box;
        }
    }
    @layer utilities {
        .scrollable-y {
            @apply overflow-y-auto;
            @apply -mr-2;
            @apply pr-2;
        }
    }
    img {
        -webkit-user-drag: none;
    }
</style>
