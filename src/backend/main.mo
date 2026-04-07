import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

actor {
  type TimeSlot = {
    id : Nat;
    hostUsername : Text;
    date : Text;
    time : Text;
    durationMinutes : Nat;
    location : Text;
    courtType : Text;
    notes : ?Text;
    status : Text;
    bookerUsername : ?Text;
  };

  module TimeSlot {
    public func compare(a : TimeSlot, b : TimeSlot) : Order.Order {
      switch (Text.compare(a.date, b.date)) {
        case (#equal) { Text.compare(a.time, b.time) };
        case (order) { order };
      };
    };
  };

  let timeSlots = Map.empty<Nat, TimeSlot>();
  var nextId = 1;

  // User profile comments
  let profileComments = Map.empty<Text, Text>();

  public shared ({ caller }) func createTimeSlot(slot : TimeSlot) : async Nat {
    let newSlot : TimeSlot = {
      slot with
      id = nextId;
      status = "available";
      bookerUsername = null;
    };
    timeSlots.add(nextId, newSlot);
    nextId += 1;
    newSlot.id;
  };

  public query ({ caller }) func getAllTimeSlots() : async [TimeSlot] {
    timeSlots.values().toArray().sort();
  };

  public shared ({ caller }) func bookSlot(slotId : Nat, bookerUsername : Text) : async () {
    switch (timeSlots.get(slotId)) {
      case (null) {
        Runtime.trap("Time slot does not exist");
      };
      case (?slot) {
        if (slot.status == "booked") {
          Runtime.trap("Slot already booked");
        };
        let updatedSlot : TimeSlot = {
          slot with
          status = "booked";
          bookerUsername = ?bookerUsername;
        };
        timeSlots.add(slotId, updatedSlot);
      };
    };
  };

  // Cancel booking by the person who booked the slot
  public shared ({ caller }) func cancelBooking(slotId : Nat, bookerUsername : Text) : async () {
    switch (timeSlots.get(slotId)) {
      case (null) { Runtime.trap("Time slot does not exist") };
      case (?slot) {
        if (slot.status != "booked") {
          Runtime.trap("Slot is not booked");
        };
        switch (slot.bookerUsername) {
          case (null) { Runtime.trap("No booker on this slot") };
          case (?bUsername) {
            if (bUsername != bookerUsername) {
              Runtime.trap("Only the booker can cancel this booking");
            };
          };
        };
        let updatedSlot : TimeSlot = {
          slot with
          status = "available";
          bookerUsername = null;
        };
        timeSlots.add(slotId, updatedSlot);
      };
    };
  };

  // Cancel booking by the host of the slot
  public shared ({ caller }) func cancelSlotAsHost(slotId : Nat, hostUsername : Text) : async () {
    switch (timeSlots.get(slotId)) {
      case (null) { Runtime.trap("Time slot does not exist") };
      case (?slot) {
        if (slot.hostUsername != hostUsername) {
          Runtime.trap("Only the host can cancel this slot");
        };
        if (slot.status != "booked") {
          Runtime.trap("Slot is not booked");
        };
        let updatedSlot : TimeSlot = {
          slot with
          status = "available";
          bookerUsername = null;
        };
        timeSlots.add(slotId, updatedSlot);
      };
    };
  };

  public shared ({ caller }) func editTimeSlot(slotId : Nat, hostUsername : Text, updatedSlot : TimeSlot) : async () {
    switch (timeSlots.get(slotId)) {
      case (null) { Runtime.trap("Time slot does not exist") };
      case (?slot) {
        if (slot.status == "booked" or slot.hostUsername != hostUsername) {
          Runtime.trap("Cannot edit this time slot");
        };
        let newSlot : TimeSlot = {
          id = slotId;
          hostUsername = slot.hostUsername;
          date = updatedSlot.date;
          time = updatedSlot.time;
          durationMinutes = updatedSlot.durationMinutes;
          location = updatedSlot.location;
          courtType = updatedSlot.courtType;
          notes = updatedSlot.notes;
          status = slot.status;
          bookerUsername = slot.bookerUsername;
        };
        timeSlots.add(slotId, newSlot);
      };
    };
  };

  public shared ({ caller }) func deleteTimeSlot(slotId : Nat, hostUsername : Text) : async () {
    switch (timeSlots.get(slotId)) {
      case (null) { Runtime.trap("Time slot does not exist") };
      case (?slot) {
        if (slot.status == "booked" or slot.hostUsername != hostUsername) {
          Runtime.trap("Cannot delete this time slot");
        };
        timeSlots.remove(slotId);
      };
    };
  };

  public query ({ caller }) func getSlotsByUsername(username : Text) : async [TimeSlot] {
    timeSlots.values().toArray().filter(
      func(slot) {
        slot.hostUsername == username or slot.bookerUsername == ?username;
      }
    );
  };

  public shared ({ caller }) func setProfileComment(username : Text, comment : Text) : async () {
    profileComments.add(username, comment);
  };

  public query ({ caller }) func getProfileComment(username : Text) : async ?Text {
    profileComments.get(username);
  };

  func addInitialSlots() {
    let initialSlots : [TimeSlot] = [
      {
        id = 1;
        hostUsername = "Alex";
        date = "2026-04-10";
        time = "09:00";
        durationMinutes = 60;
        location = "CityPark";
        courtType = "clay";
        notes = ?("Morning match");
        status = "available";
        bookerUsername = null;
      },
      {
        id = 2;
        hostUsername = "Maria";
        date = "2026-04-12";
        time = "15:30";
        durationMinutes = 90;
        location = "RiverSide";
        courtType = "synthetic";
        notes = ?("Afternoon session");
        status = "available";
        bookerUsername = null;
      },
      {
        id = 3;
        hostUsername = "Sam";
        date = "2026-03-29";
        time = "11:00";
        durationMinutes = 60;
        location = "CommunityCenter";
        courtType = "hard";
        notes = ?("Sunday game");
        status = "available";
        bookerUsername = null;
      },
      {
        id = 4;
        hostUsername = "Jamie";
        date = "2026-04-15";
        time = "18:00";
        durationMinutes = 120;
        location = "OldTown";
        courtType = "grass";
        notes = ?("Evening match");
        status = "available";
        bookerUsername = null;
      },
      {
        id = 5;
        hostUsername = "Chris";
        date = "2026-04-08";
        time = "07:30";
        durationMinutes = 60;
        location = "SportsClub";
        courtType = "hard";
        notes = ?("Early morning");
        status = "available";
        bookerUsername = null;
      },
      {
        id = 6;
        hostUsername = "Emily";
        date = "2026-04-20";
        time = "20:00";
        durationMinutes = 90;
        location = "WestEnd";
        courtType = "clay";
        notes = ?("Night game");
        status = "available";
        bookerUsername = null;
      },
    ];

    initialSlots.values().forEach(func(slot) { timeSlots.add(slot.id, slot) });
    nextId := 7;
  };

  addInitialSlots();
};
