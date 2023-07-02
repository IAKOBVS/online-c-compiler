#include <stdio.h>
int main(int argc, char **argv)
{
	if (argc != 3)
		return 1;
	FILE *fp = fopen(argv[2], "w");
	if (!fp)
		return 1;
	fputs(argv[1], fp);
	fclose(fp);
	return 0;
}
