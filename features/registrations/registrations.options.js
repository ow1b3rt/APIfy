import { getClassesService } from "../classes/classes.services.js";

export async function getRegistrationOptionsController(req, res) {
  const classes = await getClassesService();
  
  // unique courses
  const courses = [...new Set(classes.map(c => c.name))];
  
  // map schedules
  const schedulesMap = classes.map(c => ({
    label: `${c.startTime} - ${c.endTime}`,
    start_time: c.startTime,
    end_time: c.endTime,
    course: c.name
  }));
  
  const schedules = schedulesMap.filter((v, i, a) => a.findIndex(t => (t.label === v.label && t.course === v.course)) === i);

  res.status(200).json({
    success: true,
    data: {
      courses,
      schedules
    }
  });
}
