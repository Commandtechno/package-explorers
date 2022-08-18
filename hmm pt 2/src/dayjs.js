import dayjs from "dayjs";

import duration from "dayjs/plugin/duration";
import relative from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(relative);