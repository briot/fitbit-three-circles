import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import { me } from "appbit";
import { today } from "user-activity";
import { battery } from "power";

const showSeconds = true;

// Get a handle on the <text> element
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");
const day = document.getElementById("day");
const steps = me.permissions.granted("access_activity")
  ? document.getElementById("steps")
  : undefined;

function setBodyPresence(present) {
  if (present) {
    seconds.style.visibility = showSeconds ? "visible" : "hidden";
    clock.granularity = showSeconds ? "seconds" : "minutes";
  } else {
    seconds.style.visibility = "hidden";
    clock.granularity = "minutes";
  }
}

if (BodyPresenceSensor) {
  const bodyPresence = new BodyPresenceSensor();
  bodyPresence.onreading = () => {
    setBodyPresence(bodyPresence.present);
  };
  bodyPresence.start();
} else {
  setBodyPresence(true);
}

// Update the <text> element every tick with the current time
clock.ontick = evt => {
  const now = evt.date;
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const d = now.getDate();

  hours.groupTransform.rotate.angle = 30.0 * (h + m / 60) - 90.0;
  minutes.groupTransform.rotate.angle = 6.0 * m - 90.0;

  if (showSeconds) {
    const s = now.getSeconds();
    seconds.groupTransform.rotate.angle = 6.0 * s - 90.0 - 1; // -1 because of width
  }

  day.groupTransform.rotate.angle = (360 / 32) * (d - 1) - 90;

  if (steps) {
    steps.text = `${today.adjusted.steps}`;
    // (today.local.elevationGain !== undefined)
  }
};

const charge1 = document.getElementById("charger");
battery.onchange = () => {
  const level = battery.chargeLevel;
  const charging = battery.charging;
  charge1.height = (38 * level) / 100;
  charge1.y = -31 - charge1.height;
};

const heartRateCircle = document.getElementById("heartRateCircle");
if (
  heartRateCircle &&
  HeartRateSensor &&
  me.permissions.granted("access_heart_rate")
) {
  const maxHeartRate = 220;
  const minHeartRate = 0;
  const hrm = new HeartRateSensor();
  hrm.start();
  hrm.onreading = () => {
    heartRateCircle.sweepAngle =
      360 * ((hrm.heartRate - minHeartRate) / (maxHeartRate - minHeartRate));
  };
}
