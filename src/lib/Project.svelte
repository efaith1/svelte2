<script>
    export let info = {};
    export let hLevel = 2; 

    let p = info;
</script>

<style>
    article {
    display: grid;
    grid-template-rows: subgrid; 
    grid-row: span 3; 
    }
</style>

<article>
<a href={info.link}>
    <svelte:element this={"h" + hLevel}>{info.title}</svelte:element>
</a>
<img src={info.image} alt="">
<p>{info.description}</p>
</article>