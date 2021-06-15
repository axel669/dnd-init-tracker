<script>
    import AppStyle from "svelte-doric/core/app-style"
    import baseline from "svelte-doric/core/baseline"
    import theme from "svelte-doric/core/theme/tron"

    import TitleBar from "svelte-doric/core/title-bar"

    import TurnEntry from "./comp/turn-entry.svelte"
    import FooterMenu from "./comp/footer-menu.svelte"

    import turns from "./state/turns"
</script>

<style>
    app-layout {
        display: grid;
        min-height: 100%;
        grid-template-columns: 1fr;
        grid-template-rows: min-content auto min-content;
    }

    turn-layout {
        display: grid;
        grid-template: 1fr;
        gap: 4px;
        padding: 4px;
    }
</style>

<AppStyle {baseline} {theme} />

<app-layout>
    <TitleBar sticky>
        <title-text>
            D&D Initiative Tracker
        </title-text>
    </TitleBar>

    <div>
        <turn-layout>
            {#each $turns as entry (entry.id)}
                <TurnEntry {entry} />
            {/each}
        </turn-layout>
    </div>

    <FooterMenu />
</app-layout>
