<script>
    import projects from '$lib/projects.json';
    import Project from "$lib/Project.svelte";
    import Pie from '$lib/Pie.svelte';

    let pieData;
    let query = "";
    let filteredProjects;
    let selectedYearIndex = -1;
    let selectedYear;
    let filteredByYear;

    $: {
        filteredByYear = filteredProjects.filter(project => {
            return selectedYear ? project.year === selectedYear : true;
        });
    }
    $: selectedYear = selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;


        // MAKE THE SEARCH CASE-INSENSITIVE
    $: filteredProjects = projects.filter(project => {
        if (query) {
            return project.title.toLowerCase().includes(query.toLowerCase());
        }

        return true;
    });

    // SEARCH ACROSS ALL PROJECT METADATA, NOT JUST TITLES
    $: filteredProjects = projects.filter(project => {
        let values = Object.values(project).join("\n").toLowerCase();
        return values.includes(query.toLowerCase());
    });

     // CALCULATE pieData BASED ON filteredProjects
     $: {
        let rolledData = d3.rollups(filteredProjects, v => v.length, d => d.year);
        pieData = rolledData.map(([year, count]) => {
            return { value: count, label: year };
        });
    }
</script>

<h1>{filteredProjects.length} Projects </h1>
<svelte:head>
    <title>Projects</title>
</svelte:head>

<Pie data={pieData} bind:selectedIndex={selectedYearIndex} />
<input type="search" bind:value={query}
       aria-label="Search projects" placeholder="🔍 Search projects…" />

<div class="projects">
    {#each filteredByYear as p}
        <Project info={p} />        
    {/each}
</div>
