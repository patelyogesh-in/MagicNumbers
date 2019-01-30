
using Sitecore.Diagnostics;
using Sitecore.Globalization;
using Sitecore.Pipelines.Upload;
using System;
using System.Collections.Generic;
using System.IO;
using System.Xml;
namespace SitecoreTactics.Pipelines.Upload
{
    public class CheckForRestrictedMagicNumber : UploadProcessor
    {
        public void Process(UploadArgs args)
        {
            foreach (string fileKey in args.Files)
            {
                string fileName = args.Files[fileKey].FileName;
                
                byte[] bytesToFindMagicNumber = ReadBytes(args.Files[fileKey].InputStream);
                string magicString = ByteArrayToString(bytesToFindMagicNumber);

                if (IsRestrictedMagicNumber(magicString))
                {
                    args.ErrorText = Translate.Text(string.Format("The file \"{0}\" cannot be uploaded.", fileName));
                    Log.Warn(args.ErrorText, this);
                    args.AbortPipeline();
                }
            }
        }

        private bool IsRestrictedMagicNumber(string magicString)
        {
            List<string> restrictedMagicNumbers = new List<string>();
            restrictedMagicNumbers.Add("50 4b 03 04"); // ZIP
            restrictedMagicNumbers.Add("4d 5a"); // EXE, etc. Windows/DOS executable files

            // Find more magic numbers from - http://www.astro.keele.ac.uk/oldusers/rno/Computing/File_magic.html
            // You can also find magic numbers by editing any file in Notepad and identify first few bytes.. that's called magic number...
            
            foreach (string magicNumber in restrictedMagicNumbers)
            {
                if (magicString.StartsWith(magicNumber, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            return false;
        }

        private byte[] ReadBytes(Stream stream)
        {
            try
            {
                int bytesCount = 10;

                byte[] bytes = new byte[bytesCount];
                int n = stream.Read(bytes, 0, bytesCount);
                return bytes;
            }
            catch
            {
                return null;
            }
        }

        public static string ByteArrayToString(byte[] ba)
        {
            string hex = BitConverter.ToString(ba);
            return hex.Replace("-", " ");
        }
    }
}
