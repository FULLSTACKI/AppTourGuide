using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TourGuideBackend.Middleware
{
    public class AppErrorExceptionFilter : IExceptionFilter
    {
        public void OnException(ExceptionContext context)
        {
            var result = new ObjectResult(new { error = context.Exception.Message }) { StatusCode = 500 };
            context.Result = result;
        }
    }
}
