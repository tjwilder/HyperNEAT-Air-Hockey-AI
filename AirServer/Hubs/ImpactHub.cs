using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Web.Helpers;
using System.Diagnostics;
using AirServer.Controllers;
using HyperNEATAirHockey;
using System.Threading;

namespace AirServer
{
    public class ImpactHub : Hub
    {
        private static bool _first = true;
        public static List<List<Impact>> GameImpacts = new List<List<Impact>>();
        public static List<List<Coord>> GameCoords = new List<List<Coord>>();
        public static ExperimentHandler Experimenter { get; set; }
        public static bool working = false;
        public static string lastReceived;
        public static string last;
        public static Thread pingThread = new Thread(Ping);

        static ImpactHub() { pingThread.Start(); }

        public void Send(string message)
        {
            working = true;
            if (lastReceived == message)
            {
                //Clients.All.outputs(last);
                working = false;
                return;
            }
            lastReceived = message;
            var data = Json.Decode(message);
            if (_first)
            {
                _first = false;
                if (data.type != "game")
                {
                    Experimenter = new ExperimentHandler(0, 0);
                }
                else
                {
                    var gameData = Json.Decode<GameData>(message);
                    Experimenter = new ExperimentHandler(gameData.Coords.Count(c => c.Color == "red"), gameData.Coords.Count(c => c.Color == "blue"));
                }
            }


            if (data.type == "game")
            {
                var gameData = Json.Decode<GameData>(message);

                GameImpacts.Add(gameData.Impacts);
                GameCoords.Add(gameData.Coords);

                var ret = Experimenter.GetMoves(gameData.Coords).ToArray();
                last = Json.Encode(new { type = "game", message = ret });
                //Clients.All.outputs(last);
            }
            else if (data.type == "done")
            {
                var scoreData = Json.Decode<ScoreData>(message);
                var fitnessData = new FitnessData();
                fitnessData.Coords = GameCoords;
                fitnessData.Impacts = GameImpacts;
                fitnessData.Score = scoreData;

                Experimenter.LogFitness(fitnessData);
                last = Json.Encode(new { type = "done", message = "done" });
                //Clients.All.outputs(last);
            }
            working = false;
        }

        public static void Ping()
        {
            while (true)
            {
                //Thread.Sleep(new TimeSpan(0, 0, 5));
                if (!working)
                    GlobalHost.ConnectionManager.GetHubContext<ImpactHub>().Clients.All.outputs(last);
            }
        }
    }

}