“Hello from Pie.svelte”

<script>
    import * as d3 from 'd3';
   
    import { onMount, setContext } from 'svelte';

    export let data = [];
    export let selectedIndex = -1;

    let arcData = [];
    let arcs = [];

    $: {
        let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

        let sliceGenerator = d3.pie().value(d => d.value);
        arcData = sliceGenerator(data);
        arcs = arcData.map(d => arcGenerator(d));
    }

    onMount(() => {
        setContext('arcs', arcs);
    });
    
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let query = "";
    let filteredProjects;

    $: {
        filteredProjects = projects.filter(project => {
            let values = Object.values(project).join("\n").toLowerCase();
            return values.includes(query.toLowerCase());
        });

        // Calculate pieData based on filteredProjects
        let rolledData = rollup(filteredProjects, v => v.length, d => d.year);
        pieData = rolledData.map(([year, count]) => {
            return { value: count, label: year };
        });
    }

    let filteredByYear = [];

    // Reactively filter projects by year
    $: {
        if (query === "") {
            filteredByYear = filteredProjects; // If no query, use all filtered projects
        } else {
            // Filter by year if query is not empty
            filteredByYear = filteredProjects.filter(project => {
                return project.year.includes(query);
            });
        }
    }

    selectedIndex = selectedIndex === index ? -1 : index;
 
    function toggleWedge(index, event) {
    if (!event.key || event.key === "Enter") {
        selectedIndex = index;
    }
}

</script>

<input type="search" bind:value={query}
       aria-label="Search projects" placeholder="🔍 Search projects…" />


<div class="container">
    <svg viewBox="-50 -50 100 100">
        {#each arcs as arc, index}
	        <path d={arc} fill={ colors(index) } class:selected={selectedIndex === index}
	            on:click={e => selectedIndex = index} tabindex="0" role="button" aria-label="Select Wedge" on:click={e => toggleWedge(index, e)} on:keyup={e => toggleWedge(index, e)} />
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

        /* Do not clip shapes outside the viewBox */
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
