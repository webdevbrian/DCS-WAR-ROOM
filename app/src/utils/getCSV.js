export function getCSV(file) {
    return new Promise(function(resolve, reject) {
      require('fs').readFile(file, "utf8", function(err, data) {
        if (err) {
          reject(err);
        } else {
          let lines = data.split('\n'),
              columns = [],
              item = {},
              flightLogItems = [];

          for(let i = 0; i < lines.length - 1; i++) {
            // Skip the row of column headers
            if(i === 0) continue;

            let line = lines[i],
                columns = line.split(',');

            let primaryObjectID = columns[0],
                primaryObjectName = columns[1],
                PrimaryObjectCoalition = columns[2],
                PrimaryObjectPilot = columns[3],
                PrimaryObjectRegistration = columns[4],
                PrimaryObjectSquawk = columns[5],
                Event = columns[6],
                Occurences = columns[7],
                SecondaryObjectID = columns[8],
                SecondaryObjectName = columns[9],
                SecondaryObjectCoalition = columns[10],
                SecondaryObjectPilot = columns[11],
                SecondaryObjectRegistration = columns[12],
                SecondaryObjectSquawk = columns[13],
                RelevantObjectID = columns[14],
                RelevantObjectName = columns[15],
                RelevantObjectCoalition = columns[16],
                RelevantObjectPilot = columns[17],
                RelevantObjectRegistration = columns[18],
                RelevantObjectSquawk = columns[19],
                flightLogID = columns[20]; // Pass this in from flight log

            flightLogItems.push({
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

          } // end for
          resolve(flightLogItems);

        } // end else
      }); // end readFile
    }); // return promise
  } // end getCSV