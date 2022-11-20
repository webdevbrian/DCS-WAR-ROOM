# DCS-WAR-ROOM
A digital combat simulator oriented flight and combat stats system powered by tacview

---

## **Useful links**
[SQL Lite Studio](https://sqlitestudio.pl/) - Great for dealing with the SQL Lite database

[Tacview](https://www.tacview.net/product/about/en/) - You do not need the paid for version for this to run, but it's a great app and I highly encourage you to purchase this - they are a great group of devs!

[Digital Combat Simulator](https://www.digitalcombatsimulator.com/en/) - Pew pew

---

## **General tasks**
[X] Build base repository

[X] Build base SQLite database for data imports and management

[X] Run test imports of tacview exports

[X] Create default SQLite database and git ignore `main_db.sqlite3` to retain clean database reference

---

## **Tooling**
[IN PROGRESS] Build tool for automating tacview file csv exports to `flightlogimports table` and `flightlogs` in database

---

## **User interface for data management (importing and other)**

[](Create frame work that utilizes bootstrap or otherwise in a HTML / web interface for interaction)

[](Create interface for database associations for pilot duplication)

---

## **Visualization**

COMING SOON(tm)

---

## **Database**

Currently I am using SQLite for the database. Simply just because I like the simplicity of it, nothing more really. I could be swayed into porting this over to another database in the future if given a very good reason or if we encounter performance issues.

Anothe reason I do like using SQLite is that "SQLiteStudio" (the app of choice I'm using for this) is cross platform and in my opinion "bullshit free" in regards to bloat around what it needs to do. It provides a fantastic GUI for interfacing with the database for table / column changes we can check in for the "default" database that you will be using as a foundation for your flightlog imports.

Below is a list of the current tables and columns currently used in the database with a description of it's data. This is so when you're poking around looking at the data you understand some of the types but more importantly how some of the data is formatted as to avoid confusion.

### **Tables and columns**

> TABLE: **flightlogimports**
> 
> **Description**: This table is structured to take all tacview flightlog csv exports directly with the addition of a `flightlog_id` and `id` column for flight log import tracking / references for later retreiving. The flight logs are imported into this table by omitting the first column which has the column headers (named as the ones in this table).

> TABLE: **flightlogs**
> 
> **Description**: This table is for tracking the actual flight log file imports with the tool. The `id` column here is referenced to the `flightlog_id` in the `flightlogimports` table for association purposes for later database querying.

> TABLE: **munitions**
> 
> **Description**: The idea with this table is to reference this data for a later implementation of total munitions used and spent with cost calculations. Later on, it may be fun to explore a system which incorporates calculating munition expendature per mission, per pilot for future use. Like an amazon.com version for bombs! No idea, just thought this would be fun and could open up some potential future moves with the system in whole. This should ideally be controlled by a UI for the user running this system for their group so they can add munitions and costs per munition.

> TABLE: **pilotdata**
> 
> **Description**: This table tracks overall pilot data as it pertains to the system for statistics. There are some interesting columns in here that need to be talked about how they will be formatted as it will probably be confusing to people who have no idea going into this what they're looking at! So let's demystify that.
> 
> The three main columns that differ from ones like `kills` and `deaths` which should be self explanatory (this is OVERALL kills and deaths across all imported missions) are the columns `flights_flown` and `landings`. These three are dynamically updated arrays for each given tracked pilot. They are associative in that the first in the order for `aircraft_flown` will then have a tracked array slot in `flights_flown` and `landings` *so that each airframe flown by this pilot has tracked data for the amount of flights flown and landings of that airframe, not all airframes together!* I did this so that we can get more specific data about landings and flights for each specific airframe for later data comparisons and visualizations. Please note: The way this is "judged" is that a `hastakenoff` event matches a following `haslanded` event from tacview. That is what I've judged in the code as a successful and log-able flight. If the pilot takes off and doesn't land (i.e. they DIE!) welp let's not track that. You can find the accompanying part in the code to change this, and, in the future I may provide different selectable system options to calculate this to people's likings via a selection i.e. "select default flight calculation / etc".
