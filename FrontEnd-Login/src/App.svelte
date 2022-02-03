<!-- Script to implement varibales realted to login System GUI -->
<!-- Checks If Inputs are empty -->
<script> 
    let email = "";
    let password = "";
    let isLoading = false;
    let isSuccess = false;
    export let submit;
    let errors = {};
    const handleSubmit = () => {
    errors = {};

    if (email.length === 0) {
      errors.email = "empty";
    }
    if (password.length === 0) {
      errors.password = "empty";
    }

    if (Object.keys(errors).length === 0) {
      isLoading = true;
      submit({ email, password })
        .then(() => {
          isSuccess = true;
          isLoading = false;
        })
        .catch(err => {
          errors.server = err;
          isLoading = false;
        });
    }
  };
</script>

<!-- Implementation of the GUI of Login system -->
<!-- form method produce the frame of the login GUI with the specfifications -->
<!-- label method formats the labels and images of login GUI -->
<!-- input method formats the display for email/passwarod inputs -->
<!-- input:focus cleans up the outline of inputs -->
<!-- button method produce the button with specfication below-->
<!-- button:hover method puts in setting changes -->
<!-- h1 method moves logo img to certain position -->
<!-- .errors method  position error message if inputs are wrong-->
<!-- .success method  position success method in position -->

<style>
    form {
      background: #fff;
      padding: 50px;
      width: 250px;
      height: 400px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-shadow: 0px 20px 14px 8px rgba(0, 0, 0, 0.58);
    }

    label {
      margin: 10px 0;
      align-self: flex-start;
      font-weight: 500;
    }

    input {
      border: none;
      border-bottom: 1px solid #ccc;
      margin-bottom: 20px;
      transition: all 300ms ease-in-out;
      width: 100%;
    }

    input:focus {
      outline: 0;
      border-bottom: 1px solid #666;
    }

    button {
      margin-top: 1px;
      background: black;
      color: white;
      padding: 10px 0;
      width: 200px;
      border-radius: 25px;
      text-transform: uppercase;
      font-weight: bold;
      cursor: pointer;
      transition: all 300ms ease-in-out;
    }

    button:hover {
      transform: translateY(-2.5px);
      box-shadow: 0px 1px 10px 0px rgba(0, 0, 0, 0.58);
    }

    h1 {
      margin: 10px 20px 30px 20px;
      font-size: 40px;
    }

  .errors {
    list-style-type: none;
    padding: 10px;
    margin: 0;
    border: 2px solid #be6283;
    color: #be6283;
    background: rgba(190, 98, 131, 0.3);
  }

  .success {
    font-size: 24px;
    text-align: center;
  }
</style>

<!-- Button system check -->
<!-- Checks if inputs are correct and are working correctly-->

<form on:submit|preventDefault={handleSubmit}>
  {#if isSuccess}
    <div class="success">
      🔓
      <br />
      You've been successfully logged in.
    </div>
  {:else}
    <h1>
      <a href="https://www.gd.com/">
      <img src="https://media.glassdoor.com/sqll/276/general-dynamics-squarelogo.png" alt="General Dynamics" />
    </h1>

    <label>Email</label>
    <input name="email" placeholder="name@example.com" bind:value={email} />

    <label>Password</label>
    <input name="password" type="password" bind:value={password} />

    <button type="submit">
      {#if isLoading}Logging in...{:else}Log in 🔒{/if}
    </button>

    {#if Object.keys(errors).length > 0}
      <ul class="errors">
        {#each Object.keys(errors) as field}
          <li>{field}: {errors[field]}</li>
        {/each}
      </ul>
    {/if}
  {/if}
</form>