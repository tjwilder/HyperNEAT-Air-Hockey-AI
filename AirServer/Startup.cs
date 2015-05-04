using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(AirServer.Startup))]
namespace AirServer
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            //ConfigureAuth(app);

            //signalR
            // Any connection or hub wire up and configuration should go here
            GlobalHost.Configuration.DefaultMessageBufferSize = 5;
            app.MapSignalR();
        }
    }
}
