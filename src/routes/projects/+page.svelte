<script>
    import projects from '$lib/projects.json';
    import Project from "$lib/Project.svelte";
    import Pie from '$lib/Pie.svelte';

    let pieData = rolledData.map(([year, count]) => {
	return { value: count, label: year };
    });

    let rolledData = d3.rollups(projects, v => v.length, d => d.year);
    let query = "";


</script>

<h1>{projects.length} Projects </h1>
<svelte:head>
    <title>Projects</title>
</svelte:head>

<Pie data={pieData} />
<input type="search" bind:value={query}
       aria-label="Search projects" placeholder="🔍 Search projects…" />

<div class="projects">
    {#each projects as p}
        <Project info={p} />        
    {/each}
</div>
