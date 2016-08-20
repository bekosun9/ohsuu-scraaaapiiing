using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace osu_Scraping
{
    //機能としては
    //Current playing, Recent playing, メイン画面(曲一覧)
    /// <summary>
    /// SongDataクラス
    /// </summary>
    public class songData
    {
        /// <summary>
        /// 曲データ構造体
        /// </summary>
        public struct data
        {
            /// <summary>
            /// 新しい曲データを作成します。
            /// </summary>
            /// <param name="id">譜面ID</param>
            /// <param name="artist">アーティスト</param>
            /// <param name="name">曲名</param>
            public data(string id, string artist, string name)
            {
                ID = id;
                Artist = artist;
                Name = name;
            }

            public string ID { get; set; }
            public string Artist { get; set; }
            public string Name { get; set; }
        }

        public bool Available {
            get
            {
                if (list.Count > 0) return true;
                else return false;
            }

            private set
            {

            }
        }
        List<data> list;
        
        songData()
        {
            list = new List<data>();
        }

        /// <summary>
        /// 曲データをListに追加します。
        /// </summary>
        /// <param name="d">曲データ</param>
        /// <returns></returns>
        public List<data> add(data d)
        {
            list.Add(d);
            return list;
        }

        /// <summary>
        /// 曲データをListに追加します。
        /// </summary>
        /// <param name="id">曲ID</param>
        /// <param name="artist">アーティスト</param>
        /// <param name="name">曲名</param>
        /// <returns></returns>
        public List<data> add(string id, string artist, string name)
        {
            list.Add(new data(id, artist, name));
            return list;
        }


    }
}
