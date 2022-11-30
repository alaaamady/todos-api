import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
    id: Number,
    title: String,
    completed: Boolean,
    userId: Number,
});

export default mongoose.model("TodoItem", TodoSchema);
