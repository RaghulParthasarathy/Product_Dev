import { connect } from "mongoose";

async function connectToDb(url) {
  return connect(url, {});
}
export default connectToDb;