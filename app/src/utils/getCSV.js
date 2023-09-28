export function getCSV(file) {
  if(!file) return;
  return new Promise(function(resolve, reject) {
    //
    // We ultimately need to check if tacview has successfully created this csv file.
    //
    require('fs').readFile(file, "utf8", function(err, data) {
      if (err) {
        console.log('CSV READ ERROR!', err);
        reject(err);
      } else {
        let lines = data.split('\n'),
            flightLogItems = [];

        for(let i = 0; i < lines.length - 1; i++) {
          // Skip the row of column headers
          if(i === 0) continue;

          let line = lines[i],
              columns = line.split(',');

          let missionTime = columns[0],
              primaryObjectID = columns[1],
              primaryObjectName = columns[2],
              PrimaryObjectCoalition = columns[3],
              PrimaryObjectPilot = columns[4],
              PrimaryObjectRegistration = columns[5],
              PrimaryObjectSquawk = columns[6],
              Event = columns[7],
              Occurences = columns[8],
              SecondaryObjectID = columns[9],
              SecondaryObjectName = columns[10],
              SecondaryObjectCoalition = columns[11],
              SecondaryObjectPilot = columns[12],
              SecondaryObjectRegistration = columns[13],
              SecondaryObjectSquawk = columns[14],
              RelevantObjectID = columns[15],
              RelevantObjectName = columns[16],
              RelevantObjectCoalition = columns[17],
              RelevantObjectPilot = columns[18],
              RelevantObjectRegistration = columns[19],
              RelevantObjectSquawk = columns[20],
              flightLogID = columns[21];

          flightLogItems.push({
              "missionTime": missionTime,
              "primaryObjectID": primaryObjectID,
              "primaryObjectName": primaryObjectName,
              "PrimaryObjectCoalition": PrimaryObjectCoalition,
              "PrimaryObjectPilot": PrimaryObjectPilot,
              "PrimaryObjectRegistration": PrimaryObjectRegistration,
              "PrimaryObjectSquawk": PrimaryObjectSquawk,
              "Event": Event,
              "Occurences": Occurences,
              "SecondaryObjectID": SecondaryObjectID,
              "SecondaryObjectName": SecondaryObjectName,
              "SecondaryObjectCoalition": SecondaryObjectCoalition,
              "SecondaryObjectPilot": SecondaryObjectPilot,
              "SecondaryObjectRegistration": SecondaryObjectRegistration,
              "SecondaryObjectSquawk": SecondaryObjectSquawk,
              "RelevantObjectID": RelevantObjectID,
              "RelevantObjectName": RelevantObjectName,
              "RelevantObjectCoalition": RelevantObjectCoalition,
              "RelevantObjectPilot": RelevantObjectPilot,
              "RelevantObjectRegistration": RelevantObjectRegistration,
              "RelevantObjectSquawk": RelevantObjectSquawk,
              "flightLogID": flightLogID
            });
          }
        resolve(flightLogItems);
      }
    });
  });
}