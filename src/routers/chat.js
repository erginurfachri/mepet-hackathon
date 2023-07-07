const express = require("express");
const {
  client,
  deploymentId,
} = require("../lmm_models/azure_chatgpt_35_turbo");
const { JSDOM } = require('jsdom');
const travel_itineray_planner_settings = require("../lmm_configs/travel_itinerary_planner_model_config");
const router = new express.Router();

initial_input_text = "buatkan itinerary untuk liburan 7 hari di jepang bersama keluarga"
const fetch = require("node-fetch");

function extractJSON(str) {
  var firstOpen, firstClose, candidate;
  firstOpen = str.indexOf('{', firstOpen + 1);
  do {
    firstClose = str.lastIndexOf('}');
    console.log('firstOpen: ' + firstOpen, 'firstClose: ' + firstClose);
    if (firstClose <= firstOpen) {
      return null;
    }
    do {
      candidate = str.substring(firstOpen, firstClose + 1);
      console.log('candidate: ' + candidate);
      try {
        var res = JSON.parse(candidate);
        console.log('...found');
        return [res, firstOpen, firstClose + 1];
      }
      catch (e) {
        console.log('...failed');
      }
      firstClose = str.substr(0, firstClose).lastIndexOf('}');
    } while (firstClose > firstOpen);
    firstOpen = str.indexOf('{', firstOpen + 1);
  } while (firstOpen != -1);
}

router.post("/chat/completions", async (req, res) => {
  var combined = [
    travel_itineray_planner_settings.system_message,
  ]

  req.body.messages.map(message => {
    combined.push(message)
  })

  try {
    const result = await client.getChatCompletions(
      deploymentId,
      combined,
      travel_itineray_planner_settings.options
    );

    const completion_text = result.choices[0].message.content
    console.log(completion_text)
    //seperate into 3 parts: message (before json), json, and trailing_message (after json)
    const reply = completion_text.replace("`", "");
    const jsonStartIndex = reply.indexOf("{");
    const jsonEndIndex = reply.lastIndexOf("}") + 1;
    
    var jsonCandidate = null

    if (jsonStartIndex + 1 == jsonEndIndex) {
      message = reply
      trailing_message = ""
    } else {
      var message = reply.substring(0, jsonStartIndex);
      var trailing_message = reply.substring(jsonEndIndex);
      jsonCandidate = extractJSON(reply)[0].recommendedHotels
      console.log(jsonCandidate)
    }
    // Trailing message is needed because sometimes the chatgpt unexpectedly write something after hotel recommendations
    
   
    return res
      .status(200)
      .send({ data: { message: message, recommendedHotels: jsonCandidate, trailingMessage: trailing_message } });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ error: "The sample encountered an error:" + error });
  }
});

router.post("/mock/chat/completions", async (req, res) => {
  try {
    const message =
      'Great! Here\'s a suggested itinerary for your 7-day trip to Bandung:\n\nDay 1:\n- Arrive at Husein Sastranegara International Airport\n- Check-in at your hotel\n- Visit Tangkuban Perahu volcano to enjoy the scenic beauty of the active volcano\n- Try traditional Sundanese food for lunch at "Kampung Daun" restaurant\n- Visit Dago Pakar area for the amazing view of Bandung city from the hills\n\nDay 2:\n- Visit Kawah Putih, an impressive white crater lake located in Ciwidey area\n- Have a lunch at floating market in Lembang area\n- Visit the famous tea plantations in Ciwidey area\n- Back to hotel\n\nDay 3:\n- Visit the beautiful Maribaya waterfall and hot springs\n- Explore the amazing trees at Treetop Adventure Park\n- Have a lunch at a local restaurant near the area\n- Visit the stunning Glamping Lakeside in Situ Cileunca\n\nDay 4:\n- Visit the Tangkuban Parahu volcano again, but this time take a different route through Lembang\n- Have a lunch at "The Peak" restaurant with a panoramic view of Bandung city\n- Visit the Instagenic European-style Castle, "Gedung Sate"\n\nDay 5:\n- Visit the amazing Trans Studio Bandung, a theme park with indoor and outdoor rides\n- Have lunch at the theme park\'s restaurants\n- Visit the Paris Van Java shopping mall for a shopping spree\n\nDay 6:\n- Relax at the Jendela Alam Farm in Lembang and take photos with the farm animals\n- Have lunch at a local restaurant near the area\n- Visit the Rabbit town, a park with various types of rabbits\n\nDay 7:\n- Visit the Cihampelas Walk shopping street, famous for its jeans and fashion shops\n- Have lunch at a local restaurant near the area\n- Check-out from your hotel and head to the airport for your flight back home\n\nRecommended hotels:\n';
    const hotels = [
      {
        city: "Bandung",
        hotels: [
          "Padma Hotel Bandung",
          "The Trans Luxury Hotel Bandung",
          "Aryaduta Bandung",
        ],
      },
    ];

    const trailing_message = "I hope you enjoy your trip!";

    return res
      .status(200)
      .send({ data: { message, recommendedHotels: hotels, trailingMessage: trailing_message } });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ error: "The sample encountered an error:" + error });
  }
});

function get_headers() {
  var myHeaders = new fetch.Headers();
  myHeaders.append("authority", "www.traveloka.com");
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("content-type", "application/json");
  myHeaders.append("cookie", "_gcl_au=1.1.64528464.1688375517; _fbp=fb.1.1688375517356.1653679150; _tt_enable_cookie=1; _ttp=tWQCU44cTMCFTycKgYqvuCRKqxI; tv-repeat-visit=true; tv_user={\"clientId\":\"26090C67519AA3DD30335D11873976CD5A3F97086F8D30DB0D4097471D824D73\",\"sessionId\":\"0683b20e-b635-4cb4-a74c-3d0f300a0454\",\"authorizationLevel\":100,\"id\":null}; _gid=GA1.2.464425291.1688707771; tvs=qgdHX7GvehrD9XH5a3S4PWL3Nd74xArIuT+JzcRMbKddQHovERAJ9HWRLrAaZ0jPhWj5HSxm0ZKiRbldET1ham2PeYg1sQr2h/wIBjIyPQ1JQfOnq9PrXiJXCb7pG+GuCqxEXGlXIxVFvsEekf2y0r7ZSQFO0DUF3IENqj/0LA+4qBDwQhxKEjKVMadlBF6d3jW7f6f85zK7XA1xLrLbn3wpMY91AYFzJ6h8za/vSrng40uUoDT+qJIv0oQGNB1A; g_state={\"i_p\":1688794181445,\"i_l\":2}; tracking_data=%7B%22eventName%22%3A%22exp.log.fe%22%2C%22logPlogger%22%3A%7B%22timestamp%22%3A1688707785227%2C%22namespace%22%3A%22platform_web%22%2C%22originalExp%22%3A%22web_level_up_exp%22%2C%22experiment%22%3A%22web_level_up_exp%22%2C%22salt%22%3A%22platform_web.web_level_up_exp%22%2C%22checksum%22%3A%221441a7909c087dbbe7ce59881b9df8b9%22%2C%22inputs%22%3A%22%7B%5C%22hashedCookieId%5C%22%3A%5C%2226090C67519AA3DD30335D11873976CD5A3F97086F8D30DB0D4097471D824D73%5C%22%2C%5C%22sessionId%5C%22%3A%5C%220683b20e-b635-4cb4-a74c-3d0f300a0454%5C%22%2C%5C%22lang%5C%22%3A%5C%22en%5C%22%2C%5C%22country%5C%22%3A%5C%22id%5C%22%2C%5C%22currency%5C%22%3A%5C%22USD%5C%22%2C%5C%22intf%5C%22%3A%5C%22desktop%5C%22%2C%5C%22userAgent%5C%22%3A%5C%22Mozilla%2F5.0%20(Macintosh%3B%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F114.0.0.0%20Safari%2F537.36%5C%22%2C%5C%22authLvl%5C%22%3A%5C%22NOT_VERIFIED%5C%22%2C%5C%22namespace%5C%22%3A%5C%22platform_web%5C%22%7D%22%2C%22unitVal%22%3A%2226090C67519AA3DD30335D11873976CD5A3F97086F8D30DB0D4097471D824D73%22%2C%22params%22%3A%22%7B%5C%22variant%5C%22%3A%5C%22control%5C%22%7D%22%2C%22serviceId%22%3A%22web%22%7D%7D; ln_or=eyI0MzQ5MzgiOiJkIn0%3D; experienceVisit=%7B%22visitId%22%3A%22c3e42f5e-94fe-4380-9e50-781e2e29fa35%22%2C%22eventSeq%22%3A1%2C%22eventKey%22%3A%22c3e42f5e-94fe-4380-9e50-781e2e29fa35.1%22%7D; experienceVisit={\"visitId\":\"c3e42f5e-94fe-4380-9e50-781e2e29fa35\",\"eventSeq\":2,\"eventKey\":\"c3e42f5e-94fe-4380-9e50-781e2e29fa35.2\"}; amp_f4354c=vY8psJUpBJ-FlsSPlCc1T0...1h4nd79sa.1h4ne8blv.0.1.1; _gat_UA-29776811-12=1; _ga_RSRSMMBH0X=GS1.1.1688707770.2.1.1688708853.59.0.0; _ga=GA1.1.1216376923.1688375517; cto_bundle=M4GlYF9SZ1JYcWdDWERscnIlMkIlMkZmR1hsVXVZcFQyVThENzBPb3R5SGVmbzZuQ1daamlPTWJrSk8zSFl5a1NRRXJQMFUwYTN2QW9GcnJ3cWFHSjJaMVI0ZUwlMkY3SFpPYUROaUZYYm5uQ25WSmppJTJGa1FzTUw1Nnd1YnA1WEZDREJuTVU3bm13RUYlMkJyOGMyc1JsOHUwbFEwQmpObFhRJTNEJTNE; _ga_3Y1S90SFGE=GS1.2.1688707770.2.1.1688708853.60.0.0; amp_1a5adb=P_QLk4vUmh4nN5Jk0U68Up...1h4nd79s9.1h4ne8cjo.17.1.18; aws-waf-token=ecb43f1d-803f-461d-ae94-b7e195ef7ee5:GgoAqwgncsktAAAA:TfyWOAnDLIi5erxkYCkm71Br1NoOTutBhrxc9CSx1f6p/640O7kF2fodPqpK850Y6m2Z2I5owOEPRcpy1UifnL/ytpVriuDJbLpSfC1OVz4xUHSUupc/BiC8kvwUKifnhYV4r/t/MMVgXOsFDEKl7ym3cCzHOmpUKDynF4muLaEmIh/9hOErJchxX+M6BFV5r03NAQpNFKv5Ms9zNRcHZW19oojomjqlaiVgE1wspbbIioP2udZwmWkG; tvl=qgdHX7GvehrD9XH5a3S4PdE8AYpuF3hYPaT5bxhY7ZYrC2YBuM6c23lMD8yp++8a+hIudnzsfcdW6rK6+aDhoT0MMODGN3EwMkO8UmtkQeunTHpLxWdeVi23Ihm2CZqKalwWWn04j5pfcSKlvGuKeZyx8EuXlqrdx7dEIRenzcXvlyHfFnPptZUxAgMVwRNSCMYWUJplNNMY2P4/83O9X+8GNrPf8Ng75ZieUaJama8=; tvl=qgdHX7GvehrD9XH5a3S4PdE8AYpuF3hYPaT5bxhY7ZYrC2YBuM6c23lMD8yp++8aGXF/J4qXtVVpqRrWuWRqrU5jiGM2F+I37W6dz/m/O8KKp6CdZBtb1j5fx/OkzIo8alwWWn04j5pfcSKlvGuKeZyx8EuXlqrdx7dEIRenzcXvlyHfFnPptZUxAgMVwRNSCMYWUJplNNMY2P4/83O9X+8GNrPf8Ng75ZieUaJama8=");
  myHeaders.append("origin", "https://www.traveloka.com");
  myHeaders.append("referer", "https://www.traveloka.com/en-id/hotel");
  myHeaders.append("sec-ch-ua", "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"");
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append("sec-ch-ua-platform", "\"macOS\"");
  myHeaders.append("sec-fetch-dest", "empty");
  myHeaders.append("sec-fetch-mode", "cors");
  myHeaders.append("sec-fetch-site", "same-origin");
  myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");
  myHeaders.append("x-domain", "accomContent");
  myHeaders.append("x-route-prefix", "en-id");
  return myHeaders
}



router.post("/mock/chat/getHotelRecommendations", async (req, res) => {
  
  var my_headers = get_headers()
  var rawRequest = JSON.stringify({
    "fields": [],
    "data": {
      "query": req.body.hotels.name
    },
    "clientInterface": "desktop"
  });
  
  const requestOptions = {
    method: 'POST',
    headers: my_headers,
    body: rawRequest,
    redirect: 'follow'
  }

  const fetchResult = await fetch("https://www.traveloka.com/api/v1/hotel/autocomplete", 
    requestOptions
  )
  const result = await fetchResult.json()
  const hotelData = result.data.hotelContent.rows[0]
  const target_url = hotelData.targetUrl

  const fetchHotelDetailPage = await fetch("https://www.traveloka.com/en-id/hotel/" + target_url,
    requestOptions
  )
  
  const text = await fetchHotelDetailPage.text()
  const dom = new JSDOM(text);

  const description = dom.window.document.querySelector('#__next > div > div.css-1dbjc4n.r-f4gmv6.r-1jgb5lz.r-q90dru.r-95jzfe.r-13qz1uu > div:nth-child(4) > div > div:nth-child(1) > div.css-1dbjc4n.r-13awgt0 > div > div > div:nth-child(3)')
  const review = dom.window.document.querySelector('#__next > div > div.css-1dbjc4n.r-f4gmv6.r-1jgb5lz.r-q90dru.r-95jzfe.r-13qz1uu > div.css-1dbjc4n.r-obd0qt.r-18u37iz.r-ml3lyg.r-tskmnb > div.css-1dbjc4n.r-13awgt0.r-1ssbvtb > div.css-1dbjc4n.r-eqz5dr > div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-1h0z5md > div:nth-child(3) > div > div');
  const price = dom.window.document.querySelector('#__next > div > div.css-1dbjc4n.r-f4gmv6.r-1jgb5lz.r-q90dru.r-95jzfe.r-13qz1uu > div.css-1dbjc4n.r-obd0qt.r-18u37iz.r-ml3lyg.r-tskmnb > div.css-1dbjc4n.r-b83rso.r-f4gmv6 > div > h1')
  const photo = dom.window.document.querySelector('#__next > div > div.css-1dbjc4n.r-f4gmv6.r-1jgb5lz.r-q90dru.r-95jzfe.r-13qz1uu > div.css-1dbjc4n.r-bnwqim > div.css-1dbjc4n.r-18u37iz.r-n9chd3 > div.css-1dbjc4n.r-1o44xyg.r-kdyh1x.r-1loqt21.r-13awgt0.r-n9chd3.r-1udh08x.r-bnwqim.r-1otgn73.r-1i6wzkk.r-lrvibr.r-13qz1uu > img')
  
  hotelData.description = description == null? null: description.textContent
  hotelData.price = price == null ? null : price.textContent
  hotelData.photo = photo == null ? null : photo.src
  hotelData.review = review == null ? null : review.children.length

  try {
    return res
      .status(200)
      .send(hotelData);
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ error: "The sample encountered an error:" + error });
  }
});

module.exports = router;
