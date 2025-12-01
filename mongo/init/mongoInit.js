db = db.getSiblingDB("searchDB");
db.createUser({
  user: "api_user",
  pwd: "impcsearchservice",
  roles: [{ role: "readWrite", db: "searchDB" }],
});
console.log("RUNNING MONGOINIT");
