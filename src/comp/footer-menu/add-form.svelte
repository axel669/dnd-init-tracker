<script>
    import Button from "svelte-doric/core/button"
    import TextInput from "svelte-doric/core/text-input"
    import Checkbox from "svelte-doric/core/checkbox"

    export let close

    let name = ""
    let initRaw = "0"
    let ally = false
    let icon = ""
    $: init = parseFloat(initRaw)
    $: disabled = (
        isNaN(init) === true
        || name.trim() === ""
    )

    const cancel = () => close()
    const add = () => close({
        name,
        init,
        ally,
        icon,
        id: Date.now(),
        damage: 0,
    })
</script>

<style>
    fieldset {
        position: absolute;
        top: 10%;
        left: 10%;
        right: 10%;

        border: 3px solid var(--primary);
        border-radius: 4px;
        margin: 0px;
        background-color: black;
    }
    legend {
        border: 3px solid var(--primary);
        border-radius: 4px;
        margin: 0px;
        background-color: black;
    }

    form-layout {
        display: grid;
        grid-template-columns: 1fr;
    }

    icon-preview {
        display: block;
        height: 64px;
        width: 64px;
        border-radius: 32px;
        overflow: hidden;
        background-image: var(--url);
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
    }

    form-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
    }
</style>

<fieldset>
    <legend>New Entry</legend>
    <form-layout>
        <TextInput
            label="Name"
            variant="outline"
            bind:value={name}
            autofocus
        />
        <TextInput
            label="Initiative"
            variant="outline"
            bind:value={initRaw}
            type="number"
        />
        <Checkbox color="primary" bind:checked={ally}>
            Ally
        </Checkbox>

        <TextInput label="Icon URL" variant="outline" bind:value={icon} />

        <icon-preview style="--url: url({icon});" />

        <form-actions>
            <Button on:tap={cancel} variant="fill" color="danger">
                Cancel
            </Button>

            <Button on:tap={add} {disabled} variant="fill" color="secondary">
                Add
            </Button>
        </form-actions>
    </form-layout>
</fieldset>
