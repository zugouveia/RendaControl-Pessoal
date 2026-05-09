# Estágio de compilação
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copia o arquivo de projeto e restaura as dependências
# Certifique-se que o nome abaixo é igual ao seu arquivo .csproj
COPY ["RendaControl-Pessoal.csproj", "./"]
RUN dotnet restore "RendaControl-Pessoal.csproj"

# Copia o restante e compila
COPY . .
RUN dotnet publish "RendaControl-Pessoal.csproj" -c Release -o /app/publish

# Estágio de execução
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build /app/publish .

# Comando para rodar
ENTRYPOINT ["dotnet", "RendaControl-Pessoal.dll"]