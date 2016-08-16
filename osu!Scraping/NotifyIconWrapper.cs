using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Threading;
using System.Net;
using System.Net.Http;
using hap = HtmlAgilityPack;
using System.Windows.Forms;
using System.Diagnostics;


namespace osu_Scraping
{
    public partial class NotifyIconWrapper : Component
    {
        DispatcherTimer timer;
        songData dataList;
        /*
         * 現在osu!ページにログインしようとして
         * POSTデータを作成しようとしているところ
         * 8/16 0705
         * 
         * 実はログインしなくてもSampleデータは取れました
         * 8/16 0856
         */

        const string BEATMAPLIST_URL = "https://osu.ppy.sh/p/beatmaplist";

        public NotifyIconWrapper()
        {
            InitializeComponent();
            //notifyIcon1.ShowBalloonTip(10, "testTitle", "TestText", System.Windows.Forms.ToolTipIcon.None);
            //getSongData();
            contextMenuStrip1.Items.Add("test").Click += contextMenuItem_Click;
        }

        private async void contextMenuItem_Click(object sender, EventArgs e)
        {
            var q = await getSongData();
            MessageBox.Show("https://b.ppy.sh/preview/" + q.Dequeue() + ".mp3");
            Process.Start("https://b.ppy.sh/preview/" + q.Dequeue() + ".mp3");
        }

        public NotifyIconWrapper(IContainer container)
        {
            container.Add(this);

            InitializeComponent();
            //notifyIcon1.ShowBalloonTip(10, "testTitle", "TestText", System.Windows.Forms.ToolTipIcon.None);
        }

        public void showBalloon(int time, string title, string text)
        {
            notifyIcon1.ShowBalloonTip(time, title, text, System.Windows.Forms.ToolTipIcon.None);

        }

        //ページ数指定必要あり 8/17 0723
        //型はTask<Array>かTask<List>にして
        //管理を別クラスにする まとめる
        public async Task<Queue<string>> getSongData()
        {
            Queue<string> queue = new Queue<string>();
            dataList = new songData();
            var document = new hap.HtmlDocument();

            using (var client = new HttpClient())
            {
                using (var stream = await client.GetStreamAsync(new Uri(BEATMAPLIST_URL)))
                {
                    document.Load(stream, Encoding.UTF8);
                }
            }

            //that a Xpath is OK
            ///html[1]/body[1]/div[1]/div[1]/div[1]/div[4]/div[3]/div[3]/div[1]/div[3]/a[1]/@href[1]
            //var beatmaps = document.DocumentNode.SelectSingleNode(@"/html[1]/body[1]/div[1]/div[1]/div[1]/div[4]/div[3]/div[3]");
            ////*[@id="489524"]
            //var beatmaps1 = document.DocumentNode.SelectSingleNode(@"/html[1]/body[1]/div[1]/div[1]/div[1]/div[4]/div[3]/div[3]/div[HERE]/div[3]/a[1]/@href[1]");
            var beatmaps1 = document.DocumentNode.SelectNodes("//*[@class=\"beatmap\"]");
            foreach(var a in beatmaps1)
            {
                //ID取れた
                queue.Enqueue(a.Id);

                a.SelectNodes("//*[@class=\"artist\"]");
            }
            //Application.Exit();
            //https://b.ppy.sh/preview/id.mp3
            return queue;
        }

        private void contextMenuStrip1_Click(object sender, EventArgs e)
        {
            
        }
    }
}
