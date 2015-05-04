using HyperNEATAirHockey;
using SharpNeat.Core;
using SharpNeat.Domains;
using SharpNeat.EvolutionAlgorithms;
using SharpNeat.Genomes.Neat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Web;
using System.Xml;

namespace AirServer.Controllers
{
    public class ExperimentHandler
    {
        public static readonly int UUID = new Random().Next(int.MaxValue);

        List<ExperimentBlock> blue;
        List<ExperimentBlock> red;
        public static int CurrentGenome { get; set; }

        public ExperimentHandler(int bluePlayers, int redPlayers)
        {
            AirHockeyExperiment.FitnessLog = new List<FitnessData>();
            blue = new List<ExperimentBlock>();
            for (int i = 0; i < bluePlayers; i++)
            {
                blue.Add(GetExperimentBlock("blue", i, 2*(bluePlayers + redPlayers + 1), 2));
            }
            red = new List<ExperimentBlock>(redPlayers);
            for (int i = 0; i < redPlayers; i++)
            {
                red.Add(GetExperimentBlock("red", i, 2 * (bluePlayers + redPlayers + 1), 2));
            }
        }

        public void LogFitness(FitnessData fitnessData)
        {
            AirHockeyExperiment.FitnessLog.Add(fitnessData);
            CurrentGenome++;
            if (CurrentGenome == AirHockeyExperiment.POPULATION_SIZE)
            {
                Learn();
                CurrentGenome = 0;
            }
        }

        private void Learn()
        {
            foreach (var block in blue)
            {
                block.Run();
            }
            foreach (var block in red)
            {
                block.Run();
            }
            AirHockeyExperiment.FitnessLog.Clear();
        }

        public List<Coord> GetMoves(List<Coord> coords)
        {
            var ret = new List<Coord>();
            coords.OrderBy(c => c.Color).ThenBy(c => c.Index);
            foreach (var coord in coords)
            {
                if (coord.Color == "puck")
                    continue;
                ExperimentBlock block = null;
                if (coord.Color == "blue")
                    block = blue[coord.Index];
                else if (coord.Color == "red")
                    block = red[coord.Index];

                if (block != null)
                    ret.Add(block.GetOutput(coords));
            }
            return ret;
        }

        public ExperimentBlock GetExperimentBlock(string color, int index, int inputs, int outputs)
        {
            return new ExperimentBlock(new AirHockeyExperiment(color, index, inputs, outputs));
        }
    }

    public class ExperimentBlock
    {
        AirHockeyExperiment experiment;

        NeatEvolutionAlgorithm<NeatGenome> ea;

        public static IGenomeFactory<NeatGenome> globalFactory;


        public ExperimentBlock(AirHockeyExperiment experiment)
        {
            this.experiment = experiment;
            if (globalFactory == null)
                globalFactory = experiment.CreateGenomeFactory();
            //genomeList = genomeFactory.CreateGenomeList(100, 0);
            ea = experiment.CreateEvolutionAlgorithm(globalFactory);
            ea.RequestPauseAndWait();
        }

        /// <summary>
        /// Returns a Coord representing the next state of the current player
        /// </summary>
        /// <param name="coords">The current "game" in sorted order</param>
        /// <returns></returns>
        public Coord GetOutput(List<Coord> coords)
        {
            if (ExperimentHandler.CurrentGenome >= AirHockeyExperiment.POPULATION_SIZE) {
                return coords.Single(c => c.Color == experiment.Color && c.Index == experiment.Index);
            }
            var genome = ea.GenomeList[ExperimentHandler.CurrentGenome];
            var phenome = experiment.CreateGenomeDecoder().Decode(genome);
            var inputs = coords.Select(c => c.X).ToList();
            inputs.AddRange(coords.Select(c => c.Y));
            for (int i = 0; i < phenome.InputSignalArray.Length; i++)
            {
                phenome.InputSignalArray[i] = inputs[i];
            }
            phenome.Activate();
            var outputs = phenome.OutputSignalArray;
            var thisCoord = coords.Single(c => c.Color == experiment.Color && c.Index == experiment.Index);
            return new Coord(experiment.Color, experiment.Index, thisCoord.X, thisCoord.Y, outputs[0] * 500, outputs[1] * 500);
        }

        public void Run()
        {
            var waiter = new AutoResetEvent(false);
            Action<object, EventArgs> f = delegate(object sender, EventArgs e)
            {
                waiter.Set();
            };
            EventHandler handler = new EventHandler(f);
            ea.UpdateEvent += handler;
            ea.StartContinue();
            waiter.WaitOne();
            ea.UpdateEvent -= handler;
            ea.RequestPauseAndWait();

            // Save genome to xml file.
            XmlWriterSettings xwSettings = new XmlWriterSettings();
            xwSettings.Indent = true;
            using (XmlWriter xw = XmlWriter.Create(string.Format("K://Users/Khalory/Documents/AirHockey/AirHockey3v3-Gen{0}-{1}{2}-{3}.dat", ea.CurrentGeneration, experiment.Color, experiment.Index, ExperimentHandler.UUID), xwSettings))
            {
                experiment.SavePopulation(xw, ea.GenomeList);
            }
        }
    }
}