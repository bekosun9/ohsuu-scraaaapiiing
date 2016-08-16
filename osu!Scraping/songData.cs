using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace osu_Scraping
{
    public class songData
    {
        /// <summary>
        /// 初期化
        /// </summary>
        public songData()
        {
            ID = string.Empty;
            Artist = string.Empty;
            Name = string.Empty;
        }

        public string ID { get; set; }
        public string Artist { get; set; }
        public string Name { get; set; }

        public void setall(string id, string artist, string name)
        {
            ID = id;
            Artist = artist;
            Name = name;

        }
    }
}
