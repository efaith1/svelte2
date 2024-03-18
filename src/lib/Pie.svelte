<script>
    import * as d3 from 'd3';

    export let data = [];
    export let selectedIndex = -1;

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let index = -1;

    selectedIndex = selectedIndex === index ? -1 : index;

    function toggleWedge (index, event) {
	if (!event.key || event.key === "Enter") {
		selectedIndex = index;
	}
}

    let arcData = [];
    let arcs = [];

    $: {
        let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
        let sliceGenerator = d3.pie().value(d => d.value);
        arcData = sliceGenerator(data);
        arcs = arcData.map(d => arcGenerator(d));
    }

</script>

<div class="container">

    <svg viewBox="-50 -50 100 100">
        {#each arcs as arc, index}
            <path d={arc} fill={ colors(index) }
                class:selected={selectedIndex === index}
                on:click={e => toggleWedge(index, e)} on:keyup={e => toggleWedge(index, e)} tabindex="0" role="button" aria-label="Select Wedge"/>
        {/each}

    </svg>
    
    <ul class="legend">
        {#each data as d, index}
            <li style="--color: { colors(index) }">
                <span class="swatch"></span>
                {d.label} <em>({d.value})</em>
            </li>
        {/each}
    </ul>
</div>

<style>
    svg {
        max-width: 20em;
        margin-block: 2em;
        overflow: visible;
    }

    svg:has(path:hover, path:focus-visible) {
	path:not(:hover, :focus-visible) {
		opacity: 50%;
	}
}


    path {
	    transition: 300ms;
        outline: none; 

    }

    .selected {
        --color: oklch(60% 45% 0) !important;

        &:is(path) {
            fill: var(--color);
        }
    }

    .legend {
        list-style: none;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(9em, 1fr));
        gap: 10px; 
        border: 1px solid #ccc; 
        padding: 10px; 
        margin: 0; 
        flex: 1;
    }

    .legend li {
        display: flex;
        align-items: center;
    }

    .legend li .swatch {
        width: 20px; 
        height: 20px; 
        background-color: var(--color);
        margin-right: 5px;
        border-radius: 50%; 
    }

    .container {
        display: flex; 
        /* align-items: center; 
        justify-content: center;  */
    }
</style>
