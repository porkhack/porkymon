const { router, slack, text } = require('bottender/router');

async function viewReceipt(context) {
  await context.sendText('No receipt. Thank you for using this bot.');
}

//TODO
async function pullFrom() {
  pullFromLocs = ['Home Place, Sausage Street (5849)', 'Dads Place, Bacon Blvd (3938)', 'Sows Ear Ranch, Applewood (7823)'];
  return pullFromLocs;
}

//TODO
async function sendTo() {
  sendToLocs = ['Smithfield, Cudahy (1234A)', 'Bacon Bros, Waukesha (8765B)'];
  return sendToLocs;
}

//TODO
async function getHaulers() {
  haulers = ['Happy Hauler #1', 'Happy Hauler #2', 'Happy Hauler #3'];
  return haulers;
}

async function setSendTo(context, actionVal) {
  context.state.asn.processor.name = context.state.stLocCandidates[actionVal];

  let pLocs = await pullFrom();
  let pLocsList = [];
  pLocs.forEach(function (item, index) {
    pLocsList.push({'text': item, 'value': index});
  });
  context.setState({
    pfLocCandidates: pLocs
  });

  await confirmNewInfo(context, "I have learnt the location to send the pigs!",
    context.state.asn.processor.name);

  await context.chat.postMessage({
    attachments: [
      {
        text: 'Where do you want to pull your pigs from?',
        fallback: 'Something is wrong ...',
        callback_id: 'select_pullfrom',
        color: '#3AA3E3',
        attachment_type: 'default',
        actions: [
          {
            name: 'pull_from_list',
            text: 'Select a location',
            type: 'select',
            options: pLocsList,
          }
        ],
      },
    ],
  });
}

async function setPullFrom(context, actionVal) {
  cur_loc = context.state.pfLocCandidates[actionVal];
  cur_loc_name = cur_loc.match();
  cur_loc_premiseid = cur_loc.match();
  context.state.asn.scheduled.shipfromlocation.name = cur_loc_name;
  context.state.asn.scheduled.shipfromlocation.premiseid = cur_loc_premiseid;

  let haulers = await getHaulers();
  let haulerList = [];
  haulers.forEach(function (item, index) {
    haulerList.push({'text': item, 'value': index});
  });
  context.setState({
    haulerCandidates: haulers
  });

  await confirmNewInfo(context, "I have learnt the location to pull the pigs!",
    context.state.pfLocCandidates[actionVal]);

  await context.chat.postMessage({
    attachments: [
      {
        text: 'Which hauler do you want to use?',
        fallback: 'Something is wrong ...',
        callback_id: 'select_hauler',
        color: '#3AA3E3',
        attachment_type: 'default',
        actions: [
          {
            name: 'hauler_list',
            text: 'Select a hauler',
            type: 'select',
            options: haulerList,
          }
        ],
      },
    ],
  });
}

async function setHauler(context, actionVal) {
  console.log(context.state.haulerCandidates);
  console.log(actionVal);
  context.state.asn.hauler.name = context.state.haulerCandidates[actionVal];

  await confirmNewInfo(context, "I have learnt which hauler to use!",
    context.state.asn.hauler.name);

  await context.sendText('Please tell us an estimate number of heads...');
}

async function setNumHeads(context) {
  context.state.asn.enroute.head = parseInt(context.event.text.replace( /^\D+/g, ''), 10);
  console.log(context.state.asn.enroute);

  await confirmNewInfo(context, "I have learnt the pig number!",
  context.state.asn.enroute.head);

  await context.chat.postMessage({
    blocks: [
      {
        type: 'section',
        block_id: 'pickshiptimeblock',
        text: {
          type: 'mrkdwn',
          text: 'When do you plan to ship the pigs?'
        },
        accessory: {
          type: 'datepicker',
          action_id: 'pick_shipdate',
          placeholder: {
            type: 'plain_text',
            text: 'Select a date'
          }
        }
      }
    ]
  });
}

async function confirmNewInfo(context, title, text) {
  await context.chat.postMessage(
    {
      "attachments": [
          {
              "title": title,
              "text": text,
              "color": "#7CD197"
          }
      ]
    });
}

async function createAsn(context) {
  let sLocs = await sendTo();
  let sLocsList = [];
  sLocs.forEach(function (item, index) {
    sLocsList.push({'text': item, 'value': index});
  });
  context.setState({
    stLocCandidates: sLocs
  });
  // console.log(context.state);

  await context.sendText('Ok, let\'s schedule a shipment!');
  await context.chat.postMessage({
    attachments: [
      {
        text: 'Where do you want to send your pigs to?',
        fallback: 'Something is wrong ...',
        callback_id: 'select_sendto',
        color: '#3AA3E3',
        attachment_type: 'default',
        actions: [
          {
            name: 'send_to_list',
            text: 'Select a location',
            type: 'select',
            options: sLocsList,
          }
        ],
      },
    ],
  });
}

async function showShipmentMenu(context) {
  context.setState({
    asn: {
      shipdate: '',
      status: '',
      farmer: {
        name: ''
      },
      hauler: {
        name: ''
      },
      processor: {
        name: ''
      },
      scheduled: {
        shipfromlocation: {
          name: '',
          premiseid: '',
        },
      },
      enroute: {
        head: 0,
      },
    }
  });
  // console.log(context.state);
  // send a message with buttons and menu
  await context.sendText('Ok, let\'s do some shipment!');
  await context.chat.postMessage({
    attachments: [
      {
        text: 'Pick one of the following tasks',
        fallback: 'Something is wrong ...',
        callback_id: 'select_shipment',
        color: '#3AA3E3',
        attachment_type: 'default',
        actions: [
          {
            name: 'shipment_send',
            text: 'Send',
            type: 'button',
          },
          {
            name: 'shipment_schedule',
            text: 'Schedule',
            type: 'button',
          },
          {
            name: 'shipment_reschedule',
            text: 'Reschedule',
            type: 'button',
          },
        ],
      },
    ],
  });
}

async function showActionMenu(context) {
  // send a message with buttons and menu
  await context.sendText('Hello pork lover! I am your bot. Please make your selection.');
  await context.chat.postMessage({
    attachments: [
      {
        text: 'View receipt or do a shipment?',
        fallback: 'Something is wrong ...',
        callback_id: 'select_action',
        color: '#3AA3E3',
        attachment_type: 'default',
        actions: [
          {
            name: 'view_receipt',
            text: 'View Receipt',
            type: 'button',
          },
          {
            name: 'shipment',
            text: 'Shipment',
            type: 'button',
          },
        ],
      },
    ],
  });
}

async function underConstruction(context) {
  await context.sendText('Sorry! I am still learning how to do this...');
}

async function reschedule(context) {
  await underConstruction(context);
}

async function HandleInteractiveMessage(context) {
  await context.sendText(
    `Bee boo boo bop! I received your '${context.event.callbackId}' action`
  );

  console.log(context.event);

  switch (context.event.callbackId) {
    case 'select_action':
      switch (context.event.action.name) {
        case 'shipment':
          showShipmentMenu(context);
          break;
        case 'view_receipt':
          viewReceipt(context);
          break;
      }
      break;
    case 'select_shipment':
      switch (context.event.action.name) {
        case 'shipment_send':
          underConstruction(context)
          break;
        case 'shipment_schedule':
          createAsn(context);
          break;
        case 'shipment_reschedule':
          reschedule(context);
          break;
      }
      break;
    case 'select_sendto':
      let sVal = context.event.action.selectedOptions[0].value;
      setSendTo(context, sVal);
      break;
    case 'select_pullfrom':
      let pVal = context.event.action.selectedOptions[0].value;
      setPullFrom(context, pVal);
      break;
    case 'select_hauler':
      let hVal = context.event.action.selectedOptions[0].value;
      setHauler(context, hVal);
      break;
    case 'input_headcount':
      setNumHeads(context);
    case 'pick_shipdate':
      console.log(context.event.action);
      // let hVal = context.event.action.selectedOptions[0].value;
      break;
    default:
      console.log(context.event);
      break;
  }
  //pullFromOada();
  //sendText(oada_data);
}

module.exports = async function App(context) {
  return router([
    text(/\d+/i, setNumHeads),
    text('*', showActionMenu),
    slack.event('interactive_message', HandleInteractiveMessage),
  ]);
};
