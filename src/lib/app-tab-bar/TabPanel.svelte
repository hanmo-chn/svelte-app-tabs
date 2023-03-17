<script lang="ts">

    import {SvelteComponent} from "svelte";

    export let active:boolean = false;
    export let component: SvelteComponent;

</script>
<div class="tsui-app-tab-panel" style="{active ? '' : 'display: none'}">
    <svelte:component this={component}/>
</div>