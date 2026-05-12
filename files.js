/** @satisfies { import("@webcontainer/api").FileSystemTree } */

export const files = {
  'index.js': {
    file: {
      contents: `
      import express from "express";
      const app = express();
      const PORT = 3111;

      app.get("/", (req, res) => {
        res.send("Welcome to container App 🚀!")
      });

      app.listen(PORT, () => {
        console.log(\`App is listening on \${PORT}\`)
      });

      `,
    },
  },
  'package.json': {
    file: {
      contents: `{
        "name": "example-app",
        "type": "module",
        "dependencies": {
          "express": "latest",
          "nodemon": "latest"
        },
        "scripts": {
          "start": "nodemon --watch './' index.js"
        }
      }`,
    },
  },
};
