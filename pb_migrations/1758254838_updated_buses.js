/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_893801496")

  // add field
  collection.fields.addAt(10, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_96911357",
    "hidden": false,
    "id": "relation887928038",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "route_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_893801496")

  // remove field
  collection.fields.removeById("relation887928038")

  return app.save(collection)
})
