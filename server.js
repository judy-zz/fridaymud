var net = require("net");

Array.prototype.remove = function(e) {
  for (var i = 0; i < this.length; i++) {
    if (e == this[i]) { return this.splice(i, 1); }
  }
};

function Client(stream) {
  this.name = null;
  this.health = null;
  this.stream = stream;
}

var clients = [];

function tell_everybody(tha_string) {
  clients.forEach(function(c) {
    c.stream.write(tha_string + "\n");
  });
}

function health(client_name) {
  client_index = clients.indexOf(client_name);
  if(client_index > -1) {
    client_health = clients[client_index].health;
    stream.write(client_name +"'s health is "+ client_health);
  }
}

function rand (n) {
  return (Math.floor(Math.random ( ) * n + 1 ) );
}

function attack(attacker, defender_name) {
  
  // random damage
  var damage = rand(10);
  
  // check if user exists, if not attack self
  if(defender_name == attacker.name) {
    // attack self
    attacker.health = attacker.health - damage;
    tell_everybody(attacker.name + " just dealt " + damage + " to themselves! " + attacker.name + " now has " + attacker.health + " health!");
  } else {
    // check if defender exists
    var defender;
    clients.forEach(function(c) {
      if(c.name == defender_name) {
        defender = c;
      }
    })
  
    if (defender) {
      defender.health = defender.health - damage;
      tell_everybody(attacker.name + " just dealt " + damage + " to " + defender.name + "! " + defender.name + " now has " + defender.health + " health!");
      if(defender.health <= 0) {
        tell_everybody(defender.name + "has died... RIP brave, brave soul...");
        defender.stream.end();
      }
    } else {
      attacker.health = attacker.health - damage;
      tell_everybody(attacker.name + " just dealt " + damage + " to themselves! " + attacker.name + " now has " + attacker.health + " health!");
      if(attacker.health <= 0) {
        tell_everybody(attacker.name + "has died... RIP brave, brave soul...");
        attacker.stream.end();
      }
    }
  }
}

var server = net.createServer(function (stream) {
  var client = new Client(stream);
  clients.push(client);

  stream.setTimeout(0);
  stream.setEncoding("utf8");

  stream.addListener("connect", function () {
    stream.write("Welcome, enter your username:\n");
  });
  
  stream.addListener("data", function (data) {
    if (client.name == null) {
      client.name = data.match(/\S+/);
      client.health = 100;
      stream.write("===========\n");
      clients.forEach(function(c) {
        if (c != client) {
          c.stream.write(client.name + " has joined.\n");
        }
      });
      return;
    }

    var command = data.match(/^(\w*) (.*)/);
    if(command) {
      
      var action = command[1];
      var value  = command[2];
    }
    
    switch(action) {
      case "shout":
      case "say":
        tell_everybody(client.name + " says '" + value + "'");
        break;
      case "attack":
        attack(client, value);
        break;
      case "heal":
        break;
      case "health":
        health(value);
        break;
      default:
        stream.write("Sorry no such command available!\n");
        break;
      }

  });

  stream.addListener("end", function() {
    clients.remove(client);

    clients.forEach(function(c) {
      c.stream.write(client.name + " has left.\n");
    });

    stream.end();
  });
});

server.listen(7000);