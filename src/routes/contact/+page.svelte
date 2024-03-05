<h1>Contact</h1>
<svelte:head>
	<title>Contact me</title>
</svelte:head>

<form action="mailto:efk@mit.edu" method="POST" enctype="text/plain">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>

    <label for="subject">Subject:</label>
    <input id="subject" name="subject" required>

    <label for="body">Message:</label>
    <textarea id="body" name="body" rows="4" required></textarea>

    <button>Submit</button>
</form>
