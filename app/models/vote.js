const mongoose = require('mongoose');

const { Schema } = mongoose;
// const { ObjectId } = mongoose.Schema.Types; //to be used

const pollSchema = new Schema({
  title: { type: String, required: true },
  textCandidates: [
    {
      votes: { type: Number, default: 0 },
      contestant: { type: String, required: true },
    },
  ],
  voteCount: Number,
});
const VoteSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    voteType: String,
    description: { type: String, required: true },
    author: { type: String, required: true }, // to be modified
    expire: { type: Date },
    polls: [pollSchema],
  },
  {
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
    timestamps: true,
  },
);

mongoose.model('Votes', VoteSchema);
