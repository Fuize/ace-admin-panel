import bcrypt from "bcrypt";
(async () => {
  const pass = process.argv[2];
  if (!pass) { console.log("Usage: npm run hash -- <password>"); process.exit(1); }
  const hash = await bcrypt.hash(pass, 12);
  console.log(hash);
})();
