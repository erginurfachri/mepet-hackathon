const express = require("express");
const {
  client,
  deploymentId,
} = require("../lmm_models/azure_chatgpt_35_turbo");
const travel_itineray_planner_settings = require("../lmm_configs/travel_itinerary_planner_model_config");
const router = new express.Router();

router.post("/chat/completions", async (req, res) => {
  try {
    const result = await client.getChatCompletions(
      deploymentId,
      [
        travel_itineray_planner_settings.system_message,
        // this should be replaced with messages (chat history) from request
        {
          role: "user",
          content:
            "buatkan itinerary untuk liburan 7 hari di jepang bersama keluarga",
        },
      ],
      travel_itineray_planner_settings.options
    );

    //seperate into 3 parts: message (before json), json, and trailing_message (after json)
    const reply = result.choices[0].message.content.replace("`", "");
    const jsonStartIndex = reply.indexOf("{");
    const jsonEndIndex = reply.lastIndexOf("}") + 1;

    const message = reply.substring(0, jsonStartIndex);

    var hotels = reply.substring(jsonStartIndex, jsonEndIndex);

    // Trailing message is needed because sometimes the chatgpt unexpectedly write something after hotel recommendations

    var trailing_message = reply.substring(jsonEndIndex);

    return res
      .status(200)
      .send({ data: { message, hotels, trailing_message } });
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
      .send({ data: { message, hotels, trailing_message } });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ error: "The sample encountered an error:" + error });
  }
});

module.exports = router;
