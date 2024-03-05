<article>
    <a href="../A2.html">
        <h2>6.C35 Assignment 2: Exploratory Data Analysis</h2>
        <img src="../images/g2.webp" alt="">
    </a>
    <p>In this assignment, you will begin to work with public and proprietary datasets related to MAPC’s research themes and subthemes. You will choose one subtheme (i.e., one dataset) to conduct exploratory analysis using visualization, with a focus on understanding the shape & structure of the data, investigating initial questions, and developing preliminary insights & hypotheses.</p>
</article>

<article>
    <a href="../A3.html">
        <h2>6.C35 Assignment 3: Visualization Design</h2>
        <img src="../images/three.png" alt="">
    </a>
    <p>In the previous assignment, you created a large number of visualizations but likely stuck with the default design choices the software package (e.g., Tableau) made. In this assignment, you will instead focus on these design choices by sketching 3 visualizations, and then crafting a single visualization from a small dataset. You should, in theory, be able to justify the contribution of every element of the visualization.</p>
</article>


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

<svelte:element this={"h" + hLevel}>{p.title}</svelte:element>
<img src={p.image} alt="">
<p>{p.description}</p>
