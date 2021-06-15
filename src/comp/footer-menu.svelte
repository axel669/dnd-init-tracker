<script>
    import Button from "svelte-doric/core/button"
    import Dialog from "svelte-doric/core/dialog"

    import AddForm from "./footer-menu/add-form.svelte"

    import turns from "../state/turns"

    let addForm = null
    const add = async () => {
        const entry = await addForm.show()

        if (entry === undefined) {
            return
        }

        turns.add(entry)
    }
</script>

<style>
    footer-menu {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        height: 44px;
        border-top: 2px solid white;
        padding: 2px;
        gap: 2px;
        background-color: var(--background);

        position: sticky;
        bottom: 0px;
        z-index: +5;
    }
</style>

<footer-menu>
    <Button color="primary" variant="fill" on:tap={turns.sort}>
        Sort Initiatives
    </Button>

    <Button color="secondary" variant="fill" on:tap={add}>
        + Add Fighter
    </Button>
</footer-menu>

<Dialog bind:this={addForm} let:options let:close forceInteraction>
    <AddForm {options} {close} />
</Dialog>
