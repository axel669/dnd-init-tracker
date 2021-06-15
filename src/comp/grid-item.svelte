<script>
    export let grid = false
    export let center = false
    export let area
</script>

<style>
    grid-item {
        grid-area: var(--area);
    }
    grid-item.grid {
        display: grid;
    }
    grid-item.center {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

<grid-item style="--area: {area};" class:grid class:center>
    <slot />
</grid-item>
