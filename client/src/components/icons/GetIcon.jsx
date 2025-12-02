import Envelope from "./Envelope";
import Lock from "./Lock";
import Dashboard from "./Dashboard";
import Key from "./Key";
import Users from "./Users";
import Feedback from "./Feedback";
import List from "./List";
import Inventory from "./Inventory";
import History from "./History";
import Borrow from "./Borrow";
import Analytics from "./Analytics";
import Search from "./Search";
import Notification from "./Notification";
import Box from "./Box";
import Person from "./Person";
import Settings from "./Settings";
import Log from "./Log";
import Help from "./Help";

function GetIcon({ icon }) {
  const icons = new Map();

  icons.set("envelope", <Envelope />);
  icons.set("lock", <Lock />);
  icons.set("dashboard", <Dashboard />);
  icons.set("key", <Key />);
  icons.set("users", <Users />);
  icons.set("feedback", <Feedback />);
  icons.set("list", <List />);
  icons.set("inventory", <Inventory />);
  icons.set("history", <History />);
  icons.set("borrow", <Borrow />);
  icons.set("analytics", <Analytics />);
  icons.set("search", <Search />);
  icons.set("notification", <Notification />);
  icons.set("box", <Box />);
  icons.set("person", <Person />);
  icons.set("settings", <Settings />);
  icons.set("log", <Log />);
  icons.set("help", <Help />);

  return icons.get(icon);
}

export default GetIcon;
