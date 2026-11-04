/* Prints forever: the output cap must stop it, and nothing may hang. */
#include <stdio.h>

int main(void)
{
	for (;;)
		fputs("yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy\n", stdout);
}
