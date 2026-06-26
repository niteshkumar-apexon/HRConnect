using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Common
{
    public class PagedResponse<T>
    {
        public List<T> Data { get; set; } = new();

        public int TotalRecords { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages =>
            (int)Math.Ceiling(
                (double)TotalRecords / PageSize);
    }
}
