module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      name: {
          type: String,
          required: true
      },
      lastName: {
        type: String,
        required: true
      },
      useName: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      pwd:{
        type: String,
        required: true
      }
    }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const user = mongoose.model("user", schema);
  return user;
};