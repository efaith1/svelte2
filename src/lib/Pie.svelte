<div>
    <p>Hello from Pie.svelte</p>
  </div>

<script>
    import * as d3 from 'd3';

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let arc = arcGenerator({
	startAngle: 0,
	endAngle: 2 * Math.PI
    });

    export let data = [];


let sliceGenerator = d3.pie().value(d => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map(d => arcGenerator(d));

    let colors = d3.scaleOrdinal(d3.schemeTableau10);





    // export let selectedIndex = -1;

    // let arcData = [];
    // let arcs = [];

    // $: {
    //     let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    //     let sliceGenerator = d3.pie().value(d => d.value);
    //     arcData = sliceGenerator(data);
    //     arcs = arcData.map(d => arcGenerator(d));
    // }

</script>

<div class="container">
    <!-- <svg viewBox="-50 -50 100 100">
        {#each arcs as arc, index}
	        <path d={arc} fill={ colors(index) } class:selected={selectedIndex === index}
	            on:click={e => selectedIndex = index} tabindex="0" role="button" aria-label="Select Wedge" on:click={e => toggleWedge(index, e)} on:keyup={e => toggleWedge(index, e)} />
        {/each}

    </svg> -->

    <svg viewBox="-50 -50 100 100">
                {#each arcs as arc, i}
        <path d={ arc } fill={ colors(i) } />
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
    
    
    

    <!-- <ul class="legend">
        {#each data as d, index}
            <li style="--color: { colors(index) }">
                <span class="swatch"></span>
                {d.label} <em>({d.value})</em>
            </li>
        {/each}
    </ul> -->
</div>

<style>
    svg {
        max-width: 20em;
        margin-block: 2em;
        overflow: visible;
    }

    svg:has(path:hover, path:focus-visible) path:not(:hover, :focus-visible) {
        opacity: 50%;
    }

    path {
	    transition: 300ms;
        outline: none; /* Hide default focus ring */

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
        align-items: center; 
        justify-content: space-between; 
    }
</style>
