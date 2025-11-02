export const html404 = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - No Encontrado</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #f0f2f5;
      color: #333;
      flex-direction: column;
      text-align: center;
    }

    h1 {
      font-size: 6rem;
      color: #ff6b6b;
    }

    h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    p {
      font-size: 1rem;
      margin-bottom: 2rem;
      color: #555;
    }

    a {
      text-decoration: none;
      padding: 0.7rem 1.5rem;
      background: #4f46e5;
      color: white;
      border-radius: 5px;
      transition: background 0.3s ease;
    }

    a:hover {
      background: #3730a3;
    }

  </style>
</head>
<body>
  <h1>404</h1>
  <h2>Ruta no encontrada</h2>
  <p>Oops! Parece que esta API no existe o la ruta es incorrecta.</p>
  <a href="/">Ir al inicio</a>
</body>
</html>
`;