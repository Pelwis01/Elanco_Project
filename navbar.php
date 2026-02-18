<style>
    :root { --navbar-height: 56px; }
    .navbar {
        background-color: #003366;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: var(--navbar-height);
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #ffffff;
        padding: 0 16px;
        z-index: 1000;
        box-shadow: 0 1px 6px rgba(0,0,0,0.2);
    }

    .navbar-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .navbar-logo {
        height: 40px;
        display: block;
        object-fit: contain;
        margin: 0;
    }

    .nav-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    @media (max-width:600px){
        :root { --navbar-height: 48px; }
        .navbar-logo{height:32px}
    }
</style>

<header class="navbar">
    <div class="navbar-left">
        <img class="navbar-logo" src="./ElancoLogo.png" alt="Elanco Logo">
    </div>

    <div class="nav-actions">
    </div>
</header>