<script>
    import Project from "$lib/Project.svelte";
    import Pie from '$lib/Pie.svelte';

    let selectedYearIndex = -1;
    let selectedYear;
    $: selectedYear = selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;


</script>

<Pie data={pieData} bind:selectedIndex={selectedYearIndex} />

<h1>{filteredProjects.length} Projects </h1>
<svelte:head>
    <title>Projects</title>
</svelte:head>

<div class="projects">
    {#each filteredProjects as p}
        <Project info={p} />        
    {/each}
</div>
