<svelte:options immutable={true} />

<script>
    import Avatar from "svelte-doric/core/avatar"
    import Button from "svelte-doric/core/button"
    import Icon from "svelte-doric/core/icon"
    import Image from "svelte-doric/core/image"

    import GridItem from "./grid-item.svelte"
    import turns from "../state/turns"

    export let entry

    $: id = entry.id
    const moveDown = () => turns.moveDown(id)
    const moveUp = () => turns.moveUp(id)
    const remove = () => turns.remove(id)
    const changeHP = () => {
        const dif = parseFloat(
            prompt("Damage taken:", "0")
        )

        if (isNaN(dif) === true) {
            return
        }
        turns.updateEntry(id, {"damage.$apply": dmg => dmg - dif})
    }
</script>

<style>
    fieldset {
        border: 3px solid var(--primary);
        border-radius: 4px;
        margin: 0px;

        --avatar-background: teal;
    }

    fieldset legend {
        color: var(--danger);
    }
    fieldset.ally legend {
        color: var(--secondary);
    }

    info-display {
        display: grid;
        grid-template-columns: 48px 64px 56px 56px auto 56px;
        grid-auto-rows: 32px;
        grid-template-areas:
            "move-up icon init hp . remove"
            "move-down icon init hp . remove"
        ;
    }

    info-item {
        font-size: var(--text-size-title);
    }

    button-layout {
        text-align: center;
    }
    button-layout img {
        width: 32px;
        height: 32px;
        object-fit: contain;
    }
</style>

<fieldset class:ally={entry.ally}>
    <legend>{entry.name}</legend>
    <info-display>
        <GridItem area="init" center>
            <info-item>
                {entry.init}
            </info-item>
        </GridItem>

        <GridItem area="icon">
            {#if entry.icon}
                <Avatar image={entry.icon} size="64px" />
            {:else}
                <Avatar size="64px">
                    <div style="font-size: 32px;">
                        {entry.name.slice(0, 1).toUpperCase()}
                    </div>
                </Avatar>
            {/if}
        </GridItem>

        <GridItem area="hp" grid>
            <Button on:tap={changeHP}>
                <button-layout>
                    <img src="./images/heart.png" alt="" />
                    <div />
                    {entry.damage}
                </button-layout>
            </Button>
        </GridItem>

        <GridItem area="move-up" grid>
            <Button on:tap={moveUp}>
                <Icon name="expand_less" />
            </Button>
        </GridItem>
        <GridItem area="move-down" grid>
            <Button on:tap={moveDown}>
                <Icon name="expand_more" />
            </Button>
        </GridItem>

        <GridItem area="remove" grid>
            <Button color="danger" on:tap={remove}>
                <Icon name="close" />
            </Button>
        </GridItem>
    </info-display>
</fieldset>
